var t = TrelloPowerUp.iframe();

document.getElementById('configuration').addEventListener('submit', function (event) {
    event.preventDefault();

    var voteList = document.getElementById('vote-list').value;
    var mandatoryCommentVotes = Array.from(
        document.querySelectorAll('[name="mandatory-comment-votes"]')
    ).filter(function (element) {
        return element.checked;
    }).map(function (element) {
        return element.value;
    });

    var configuration = {
        voteList: voteList === '' ? null : voteList,
        mandatoryCommentVotes: mandatoryCommentVotes
    };

    t.set(
        'board',
        'shared',
        'configuration',
        configuration
    ).then(function () {
        t.closePopup();
    });
});

t.render(function () {
    return t.get('board', 'shared', 'configuration').then(function (configuration) {
        if (!isValid('object', configuration)) {
            configuration = {};
        }

        if (isValid('array', configuration.mandatoryCommentVotes)) {
            configuration.mandatoryCommentVotes.forEach(function (voteValue) {
                document.querySelector('[name="mandatory-comment-votes"][value="' + voteValue + '"]').checked = true;
            });
        }

        t.lists('all').then(function (lists) {
            if (lists.length > 0) {
                document.getElementById('vote-list').innerHTML = lists.reduce(function (carry, list) {
                    var selectedAttribute = list.id === configuration.voteList ? 'selected="selected"' : '';

                    return carry + '<option value="' + list.id + '" ' + selectedAttribute + '>' + list.name + '</option>';
                }, '<option value="">--</option>');
            }

            t.sizeTo('#configuration').done();
        });
    });
});
