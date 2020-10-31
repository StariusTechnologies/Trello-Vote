var t = TrelloPowerUp.iframe();
var checkcrossTemplate = document.getElementById('checkcross-template').innerHTML;

var resizeIframe = function () {
    var checkedRadio = document.querySelector('.section-switcher:checked');
    var nav = document.querySelector('nav ul');
    var element = document.getElementById(checkedRadio.getAttribute('data-section-id'));
    var navHeight = Math.ceil(Math.max(nav.scrollHeight, nav.getBoundingClientRect().height)) + 40;
    var elementHeight = Math.ceil(Math.max(element.scrollHeight, element.getBoundingClientRect().height)) + 40;

    t.sizeTo(Math.max(navHeight, elementHeight));
};

var saveAnimation = function (formId, saving) {
    var button = document.querySelector('#' + formId + ' button[type="submit"]');

    if (saving) {
        button.classList.add('saving');
        button.setAttribute('disabled', 'disabled');
        button.innerText = 'Saving...';
    } else {
        button.classList.remove('saving');
        button.classList.add('saved');
        button.innerText = 'Saved!';

        setTimeout(function () {
            button.classList.remove('saved');
            button.removeAttribute('disabled');
            button.innerText = 'Save';
        }, 2500);
    }
};

var getMemberRank = function (member) {
    var rank = 5;

    if (member.unconfirmed) {
        rank = 3
    }

    if (member.deactivated) {
        rank = 1
    }

    switch (member.memberType) {
        case 'admin':
            rank++;
            break;

        case 'observer':
            rank--;
            break;
    }

    return rank;
};

// I know, "list list" is confusing, but like... That's what it is!
// It is a dropdown-list of the Trello lists, yknow?
// Also I kinda wanted to add a comment to explain the name
// Because it gives me the opportunity to talk with you ♥
// Who are you? Why are you looking at this code? Hit me up!
// lilywonhalf@gmail.com
var generateListList = function (lists, voteListId) {
    var html = '<option value="">--</option>';

    if (lists.length > 0) {
        html = lists.reduce(function (carry, list) {
            var selectedAttribute = list.id === voteListId ? 'selected="selected"' : '';

            return carry + '<option value="' + list.id + '" ' + selectedAttribute + '>' + list.name + '</option>';
        }, html);
    }

    return html;
};

var createMemberTag = function (contents) {
    var tag = document.createElement('span');

    tag.innerHTML = contents;
    tag.classList.add('member-tag');

    return tag;
};

var generateMembersList = function (members, configuration) {
    var list = document.createElement('ul');
    var allChecked = Object.keys(configuration).length < 1;

    members = Object.values(members).filter(function (member) {
        return member.memberType !== 'observer';
    }).sort(function (a, b) {
        var score = 0

        if (getMemberRank(a) < getMemberRank(b)) {
            score = 1;
        } else if (getMemberRank(a) > getMemberRank(b)) {
            score = -1;
        }

        return score;
    });

    members.forEach(function (member) {
        var listItem = document.createElement('li');
        var leftDiv = document.createElement('div');
        var rightDiv = document.createElement('div');
        var checkbox = checkcrossTemplate.replace(
            /ID_PLACEHOLDER/gu,
            'can-vote-' + member.id
        ).replace(
            /NAME_PLACEHOLDER/gu,
            'can-vote-' + member.id
        ).replace(
            /ADDITIONAL_ATTRIBUTE_PLACEHOLDER/gu,
            allChecked || configuration[member.id] ? 'checked="checked"' : ''
        );

        leftDiv.innerHTML = member.fullName;
        rightDiv.innerHTML = checkbox;

        if (member.memberType !== 'normal') {
            leftDiv.appendChild(createMemberTag(member.memberType));
        }

        if (member.deactivated) {
            leftDiv.appendChild(createMemberTag('deactivated'));
        }

        if (member.unconfirmed) {
            leftDiv.appendChild(createMemberTag('unconfirmed'));
        }

        listItem.appendChild(leftDiv);
        listItem.appendChild(rightDiv);

        leftDiv.classList.add('column-grow')
        listItem.classList.add('columns-wrapper');

        list.appendChild(listItem);
    });

    return list.outerHTML;
};

document.getElementById('settings-form').addEventListener('submit', function (event) {
    event.preventDefault();
    saveAnimation('settings-form', true);

    t.get('board', 'shared', 'configuration').then(function (configuration) {
        var voteList = document.getElementById('vote-list').value;
        var mandatoryCommentVotes = Array.from(
            document.querySelectorAll('[name="mandatory-comment-votes"]')
        ).filter(function (element) {
            return element.checked;
        }).map(function (element) {
            return element.value;
        });

        configuration.settings.voteList = voteList === '' ? null : voteList;
        configuration.settings.mandatoryCommentVotes = mandatoryCommentVotes;

        return t.set(
            'board',
            'shared',
            'configuration',
            configuration
        );
    }).then(function () {
        saveAnimation('settings-form', false);
    });
});

document.getElementById('members-form').addEventListener('submit', function (event) {
    event.preventDefault();
    saveAnimation('members-form', true);

    t.get('board', 'shared', 'configuration').then(function (configuration) {
        configuration.members = {};

        Array.from(
            document.querySelectorAll('.checkcross-checkbox')
        ).forEach(function (element) {
            configuration.members[element.id.replace(/can-vote-/gu, '')] = element.checked;
        });

        return t.set(
            'board',
            'shared',
            'configuration',
            configuration
        );
    }).then(function () {
        saveAnimation('members-form', false);
    });
});

Array.from(document.getElementsByClassName('section-switcher')).forEach(function (sectionSwitcher) {
    sectionSwitcher.addEventListener('change', function (event) {
        resizeIframe();
    });
});

t.render(function () {
    var configuration = {};

    t.get('board', 'shared', 'configuration').then(function (savedConfiguration) {
        if (!isValid('object', savedConfiguration)) {
            savedConfiguration = {};
        }

        if (!isValid('object', savedConfiguration.settings)) {
            savedConfiguration.settings = {
                mandatoryCommentVotes: [],
                voteList: null
            };

            if (isValid('array', savedConfiguration.mandatoryCommentVotes)) {
                savedConfiguration.settings.mandatoryCommentVotes = savedConfiguration.mandatoryCommentVotes;
            }

            if (savedConfiguration.voteList) {
                savedConfiguration.settings.voteList = savedConfiguration.voteList;
            }

            delete savedConfiguration.mandatoryCommentVotes;
            delete savedConfiguration.voteList;
        }

        if (isValid('array', savedConfiguration.settings.mandatoryCommentVotes)) {
            savedConfiguration.settings.mandatoryCommentVotes.forEach(function (voteValue) {
                document.querySelector('[name="mandatory-comment-votes"][value="' + voteValue + '"]').checked = true;
            });
        }

        if (!isValid('object', savedConfiguration.members)) {
            savedConfiguration.members = {};
        }

        configuration = savedConfiguration;

        return t.set(
            'board',
            'shared',
            'configuration',
            configuration
        );
    }).then(function () {
        return t.lists('all');
    }).then(function (lists) {
        document.getElementById('vote-list').innerHTML = generateListList(lists, configuration.settings.voteList);
        resizeIframe();

        return t.board('members', 'memberships');
    }).then(function (data) {
        var membersFormContents = document.getElementById('members-form-contents');
        var members = {};

        data.members.forEach(function (member) {
            members[member.id] = member;
        });

        data.memberships.forEach(function (membership) {
            var idMember = membership.idMember;

            delete membership.id;
            delete membership.idMember;

            Object.assign(members[idMember], membership);
        });

        membersFormContents.innerHTML = generateMembersList(members, configuration.members);
    });
});
