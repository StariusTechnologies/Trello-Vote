var ICON = 'https://trello-votes.sirius.codes/img/icon-black.png';

/**
 * @param {string} type
 * @param {*} variable
 * @returns {boolean}
 */
var isValid = function (type, variable) {
    var isValid = false;
    type = type.toLowerCase();

    switch (type) {
        case 'array':
            type = 'object';
            isValid = variable !== undefined
                && variable !== null
                && typeof variable === type
                && variable.hasOwnProperty('length');
            break;

        default:
            isValid = variable !== undefined
                && variable !== null
                && typeof variable === type;
            break;
    }

    return isValid;
};

/**
 * @param {object} votes
 * @param {Array} members
 * @returns {*}
 */
var computeVotes = function (votes, members) {
    if (isValid('object', votes)) {
        var memberIds = members.map(function (member) {
            return member.id;
        });

        Object.keys(votes).forEach(function (id) {
            if (!memberIds.includes(id) || votes[id].value === null || votes[id].value === '') {
                delete votes[id];
            } else {
                votes[id].id = id;
            }
        });
    } else {
        votes = {};
    }

    return votes;
};

/**
 * @param {object} t
 * @returns {Promise<TResult>}
 */
var getVoteList = function (t) {
    return t.get('board', 'shared', 'configuration').then(function (configuration) {
        var voteList = null;

        if (!isValid('object', configuration)) {
            configuration = {};
        }

        if (!isValid('object', configuration.settings)) {
            configuration.settings = {};
        }

        if (configuration.voteList && !configuration.settings.voteList) {
            configuration.settings.voteList = configuration.voteList;
        }

        if (configuration.settings.voteList) {
            voteList = configuration.settings.voteList;
        }

        return voteList
    });
};

var isVoteList = function (t, list) {
    return getVoteList(t).then(function (voteList) {
        return voteList === null || list === voteList;
    });
};

var isCurrentCardInVoteList = function (t) {
    return t.card('idList').then(function (data) {
        return isVoteList(t, data.idList);
    });
};

var memberCanVote = function (t) {
    var member = t.getContext().member;

    return t.get('board', 'shared', 'configuration').then(function (configuration) {
        if (!isValid('object', configuration)) {
            configuration = {};
        }

        if (!isValid('object', configuration.members)) {
            configuration.members = {};
        }

        return typeof configuration.members[member] === 'undefined' ? true : configuration.members[member];
    });
};

var getCurrentMemberType = function (t) {
    return t.board('memberships').then(function (data) {
        var currentMemberId = t.getContext().member;
        var membership = data.memberships.find(function (membership) {
            return membership.idMember === currentMemberId;
        });

        return membership.memberType;
    });
};

var isCurrentMemberAdmin = function (t) {
    return getCurrentMemberType(t).then(function (memberType) {
        return memberType === 'admin';
    });
};

var getMembersWithoutObservers = function (t) {
    return t.board('members', 'memberships').then(function (data) {
        var observerIds = data.memberships.filter(function (memberhsip) {
            return memberhsip.memberType === 'observer';
        }).map(function (membership) {
            return membership.idMember;
        });

        return data.members.filter(function (member) {
            return !observerIds.includes(member.id);
        });
    });
};

var getMembersWhoCanVote = function (t) {
    var configuration = {};

    return t.get('board', 'shared', 'configuration').then(function (data) {
        if (!isValid('object', data)) {
            data = {};
        }

        if (!isValid('object', data.members)) {
            data.members = {};
        }

        configuration = data;

        return getMembersWithoutObservers(t);
    }).then(function (members) {
        return members.filter(function (member) {
            return typeof configuration.members[member.id] === 'undefined' ? true : configuration.members[member.id]
        });
    });
};
