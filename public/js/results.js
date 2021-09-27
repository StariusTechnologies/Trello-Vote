var t = TrelloPowerUp.iframe();
var memberId = t.getContext().member;

var displayVotes = function (votes, members) {
    var memberIdMap = {};
    var list = document.createElement('ul');

    votes = votes || {};

    members.map(function (member) {
        memberIdMap[member.id] = member.fullName;
        member.voteData = votes.hasOwnProperty(member.id) ? votes[member.id] : null;

        return member;
    });

    Object.values(members).forEach(function (memberData) {
        var listElement = document.createElement('li');
        var member = document.createElement('div');
        var comment = document.createElement('div');
        var vote = document.createElement('div');
        var memberSpan = document.createElement('span');

        var voted = memberData.voteData !== null;
        var voteData = memberData.voteData;

        listElement.classList.add(voted ? voteData.value : 'empty');

        if (memberData.id === memberId) {
            listElement.classList.add('mine');
        }

        member.classList.add('member');

        var sanitizedMemberName = sanitizeUserInput(memberData.fullName.trim()).replace(/\n/gu, '<br />');

        if (memberData.avatar === null) {
            var memberInitials = document.createElement('span');
            var sanitizedInitials = sanitizeUserInput(memberData.initials.trim()).replace(/\n/gu, '<br />');

            memberInitials.classList.add('member-initials');
            memberInitials.setAttribute('aria-label', memberData.fullName);
            memberInitials.title = sanitizedMemberName;
            memberInitials.innerHTML = sanitizedInitials;

            memberSpan.appendChild(memberInitials);
        } else {
            var memberAvatar = document.createElement('img');

            memberAvatar.classList.add('member-avatar');
            memberAvatar.src = memberData.avatar;
            memberAvatar.alt = sanitizedMemberName;
            memberAvatar.title = sanitizedMemberName;
            memberAvatar.width = 30;
            memberAvatar.height = 30;

            memberSpan.appendChild(memberAvatar);
        }

        member.appendChild(memberSpan);
        member.innerHTML += sanitizedMemberName;

        listElement.appendChild(member);

        if (voted && voteData.comment !== undefined && voteData.comment !== null && voteData.comment.trim() !== '') {
            var sanitizedComment = sanitizeUserInput(voteData.comment.trim());

            comment.classList.add('comment');
            comment.innerHTML = sanitizedComment.replace(/\n/gu, '<br />');

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
        }

        return getMembersWhoCanVote(t);
    }).then(function (members) {
        if (!isValid('array', members)) {
            t.sizeTo('#results').done();

            return null;
        }

        displayVotes(
            computeVotes(votes, members),
            members
        );
    });
});
