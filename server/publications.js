/* eslint-disable import/no-unresolved */
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { publishComposite } from 'meteor/reywood:publish-composite';
import { User } from 'meteor/socialize:user-model';
import { LikesCollection } from 'meteor/socialize:likeable';

import { CommentsCollection } from '../common/common.js';


let commentsAccessCheck = async () => true;

/** Configure application authorization before comments are published. */
export function setCommentsAccessCheck(checkAccess) {
    commentsAccessCheck = checkAccess;
}

const optionsArgumentCheck = {
    limit: Match.Optional(Number),
    skip: Match.Optional(Number),
    sort: Match.Optional(Object),
};


publishComposite('socialize.commentsFor', async function publishCommentsFor(linkedObjectId, options = { limit: 10, sort: { createdAt: -1 } }) {
    check(linkedObjectId, String);
    check(options, optionsArgumentCheck);
    if (this.userId) {
        if (!(await commentsAccessCheck(this.userId, linkedObjectId))) return this.ready();
        const currentUser = User.createEmpty(this.userId);
        const blockedUserIds = await currentUser.blockedUserIdsAsync();
        const blockedByUserIds = await currentUser.blockedByUserIdsAsync();
        const blockIds = [...blockedUserIds, ...blockedByUserIds];

        if (!blockIds.includes(linkedObjectId)) {
            return {
                find() {
                    return CommentsCollection.find({ linkedObjectId, userId: { $nin: blockIds } }, options);
                },
                children: [
                    {
                        find(comment) {
                            return Meteor.users.find({ _id: comment.userId });
                        },
                    },
                    {
                        find(comment) {
                            return LikesCollection.find({ ...comment.getLinkObject, userId: this.userId });
                        },
                    },
                ],
            };
        }
    }
    return this.ready();
});
