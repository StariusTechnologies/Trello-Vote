var showSettings = function (t) {
    return isCurrentMemberAdmin(t).then(function (isAdmin) {
        return t.modal({
            title: 'Configure voting system',
            url: isAdmin ? 'configuration' : '403'
        });
    });
};

var cardButtons = function (t) {
    return memberCanVote(t).then(function (canVote) {
        return canVote ? isCurrentCardInVoteList(t) : false;
    }).then(function (canVote) {
        if (canVote) {
            return [{
                icon: ICON,
                text: 'Vote',
                callback: function (t) {
                    return t.popup({
                        title: 'Vote',
                        url: 'vote'
                    });
                }
            }];
        }
    });
};

var cardBackSection = function (t) {
    var votes = null;
    var isInList = false;

    return isCurrentCardInVoteList(t).then(function (data) {
        if (data) {
            isInList = !!data;
        }

        return t.get('card', 'shared', 'votes');
    }).then(function (data) {
        if (data !== undefined) {
            votes = data;
        }

        return getMembersWhoCanVote(t);
    }).then(function (members) {
        if (members === undefined) {
            return;
        }

        votes = computeVotes(votes, members);

        var voteValues = ['yes', 'no', 'neutral', 'other'];
        var title = 'Votes (' + Object.keys(votes).length + '/' + members.length + ')';

        if (Object.keys(votes).length > 0) {
            var voteStats = Object.values(votes).reduce(function (carry, vote) {
                if (!carry.hasOwnProperty(vote.value)) {
                    carry[vote.value] = 0;
                }

                carry[vote.value]++;

                return carry;
            }, {});

            title += ' | ';
            var added = false;

            for (var i = 0; i < voteValues.length; i++) {
                if (voteStats.hasOwnProperty(voteValues[i])) {
                    if (added) {
                        title += ', ';
                    }

                    title += voteStats[voteValues[i]] + ' ' + voteValues[i];
                    added = true;
                }
            }
        }

        if (Object.keys(votes).length > 0 || isInList) {
            return [{
                title: title,
                icon: ICON,
                content: {
                    type: 'iframe',
                    url: t.signUrl('./results'),
                    height: 50
                }
            }];
        }
    });
};

var cardBadges = function (t) {
    var members = null;
    var isInList = false;

    return isCurrentCardInVoteList(t).then(function (data) {
        if (data) {
            isInList = !!data;
        }

        return getMembersWhoCanVote(t);
    }).then(function (data) {
        if (data === undefined) {
            return null;
        }

        members = data;

        return t.get('card', 'shared', 'votes');
    }).then(function (votes) {
        if (members === null) {
            return null;
        }

        votes = computeVotes(votes, members);
        var votesAmount = Object.keys(votes).length;
        var colour = 'light-gray';

        if (isInList) {
            if (votesAmount === members.length) {
                colour = 'green';
            } else if (votesAmount < 1) {
                colour = 'red';
            } else if (votesAmount >= ((members.length / 4 * 3) - (members.length / 12))) {
                colour = 'lime';
            } else {
                colour = 'yellow';
            }
        }

        if (votesAmount > 0 || isInList) {
            return [{
                icon: ICON,
                text: votesAmount + '/' + members.length,
                color: colour,
            }];
        }
    });
};

TrelloPowerUp.initialize({
    'show-settings': showSettings,
    'card-buttons': cardButtons,
    'card-back-section': cardBackSection,
    'card-badges': cardBadges
});
