var t = TrelloPowerUp.iframe();
var memberId = t.getContext().member;
var mandatoryCommentVotes = ['other'];

document.getElementById('answer').addEventListener('change', function (event) {
    var commentInput = document.getElementById('comment');

    if (mandatoryCommentVotes.indexOf(event.currentTarget.value) > -1) {
        commentInput.setAttribute('required', 'required');
        commentInput.setAttribute('pattern', '[a-zA-Z]+');
        commentInput.focus();
    } else {
        commentInput.removeAttribute('required');
        commentInput.removeAttribute('pattern');
    }

    if (event.currentTarget.value === '') {
        commentInput.style.display = 'none';
    } else {
        commentInput.style.display = 'block';
    }

    t.sizeTo('#vote').done();
});

document.getElementById('vote').addEventListener('submit', function (event) {
    event.preventDefault();

    t.get(
        'card',
        'shared',
        'votes'
    ).then(function (votes) {
        if (!isValid('object', votes) || !isValid('object', votes[Object.keys(votes)[0]])) {
            votes = {};
        }

        var value = document.getElementById('answer').value;
        var comment = document.getElementById('comment').value;
        var sanitizedComment = sanitizeUserInput(comment);

        votes[memberId] = {
            value: value,
            comment: value !== '' ? sanitizedComment : ''
        };

        return t.set(
            'card',
            'shared',
            'votes',
            votes
        );
    }).then(function () {
        t.closePopup();
    });
});

t.render(function () {
    t.get('board', 'shared', 'configuration').then(function (configuration) {
        var commentInput = document.getElementById('comment');

        if (!isValid('object', configuration)) {
            configuration = {};
        }

        if (!isValid('object', configuration.settings)) {
            configuration.settings = {};
        }

        if (isValid('array', configuration.settings.mandatoryCommentVotes)) {
            mandatoryCommentVotes = mandatoryCommentVotes.concat(configuration.settings.mandatoryCommentVotes);
        }

        t.get('card', 'shared', 'votes').then(function (votes) {
            if (isValid('object', votes)) {
                document.querySelector('#answer option[value="' + votes[memberId].value + '"]').setAttribute('selected', 'selected');

                if (votes[memberId].value === '') {
                    commentInput.style.display = 'none';
                } else {
                    commentInput.value = votes[memberId].comment;
                    commentInput.style.display = 'block';
                }

                if (mandatoryCommentVotes.indexOf(votes[memberId].value) > -1) {
                    commentInput.setAttribute('required', 'required');
                    commentInput.setAttribute('pattern', '[a-zA-Z]+');
                    commentInput.focus();
                } else {
                    commentInput.removeAttribute('required');
                    commentInput.removeAttribute('pattern');
                }
            }

            t.sizeTo('#vote').done();
        });
    });
});
