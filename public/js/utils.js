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

        if (isValid('object', configuration) && configuration.hasOwnProperty('voteList')) {
            voteList = configuration.voteList;
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
