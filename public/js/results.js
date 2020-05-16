var t = TrelloPowerUp.iframe();
var memberId = t.getContext().member;

var noVotes = function () {
    document.getElementById('results').innerHTML = 'No votes yet.';
    t.sizeTo('#results').done();
};

var yesVotes = function (votes, members) {
    var memberIdMap = {};
    var list = document.createElement('ul');

    members.forEach(function (member) {
        memberIdMap[member.id] = member.fullName;
    });

    Object.values(members).forEach(function (memberData) {
        var listElement = document.createElement('li');
        var member = document.createElement('div');
        var comment = document.createElement('div');
        var vote = document.createElement('div');
        var memberSpan = document.createElement('span');

        var voted = votes.hasOwnProperty(memberData.id);
        var voteData = voted ? votes[memberData.id] : null;

        listElement.classList.add(voted ? voteData.value : 'empty');

        if (memberData.id === memberId) {
            listElement.classList.add('mine');
        }

        member.classList.add('member');

        if (memberData.avatar === null) {
            var memberInitials = document.createElement('span');

            memberInitials.classList.add('member-initials');
            memberInitials.setAttribute('aria-label', memberData.fullName);
            memberInitials.title = memberData.fullName;
            memberInitials.innerHTML = memberData.initials;

            memberSpan.appendChild(memberInitials);
        } else {
            var memberAvatar = document.createElement('img');

            memberAvatar.classList.add('member-avatar');
            memberAvatar.src = memberData.avatar;
            memberAvatar.alt = memberData.fullName;
            memberAvatar.title = memberData.fullName;
            memberAvatar.width = 30;
            memberAvatar.height = 30;

            memberSpan.appendChild(memberAvatar);
        }

        member.appendChild(memberSpan);
        member.innerHTML += memberData.fullName;

        listElement.appendChild(member);

        if (voted && voteData.comment !== undefined && voteData.comment !== null && voteData.comment.trim() !== '') {
            comment.classList.add('comment');
            comment.innerHTML = voteData.comment;

            listElement.appendChild(comment);
        }

        vote.classList.add('vote');

        if (voted) {
            vote.innerHTML = voteData.value;
        } else {
            vote.classList.add('empty');
            vote.innerHTML = 'no vote yet';
        }

        listElement.appendChild(vote);
        list.appendChild(listElement);
    });

    document.getElementById('results').innerHTML = '';
    document.getElementById('results').appendChild(list);
    t.sizeTo('#results').done();
};

t.render(function () {
    var votes = null;

    return t.get('card', 'shared', 'votes').then(function (data) {
        if (isValid('object', data)) {
            votes = data;

            return t.board('members');
        } else {
            return noVotes();
        }
    }).then(function (data) {
        if (!isValid('object', data)) {
            t.sizeTo('#results').done();

            return null;
        }

        votes = computeVotes(votes, data.members);

        if (Object.values(votes).length > 0) {
            yesVotes(votes, data.members);
        } else {
            noVotes();
        }
    });
});
