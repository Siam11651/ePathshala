/**
 * @type {string | null}
 */
let userId = localStorage.getItem('user_id');
/**
 * @type {string | null}
 */
let isStudent = localStorage.getItem('student');

SetupNavBar(userId);

let params = new URLSearchParams(location.search);

if(!params.has('question_id'))
{
    location.replace('forumquestions.html');
}

let questionDetails = GetQuestionDetails(params.get('question_id'), ['QUESTION_ID', 'TITLE', 'ASKER_ID', 'ASKER_NAME',  'DATE_OF_ASK', 'RATE', 'CONTENT']);
let answerSelected = 0;
let questionTitle = document.getElementsByTagName('h2').namedItem('question-title');
let questionAskerName = document.getElementsByTagName('h4').namedItem('question-asker-name');
let rateButton = document.getElementsByTagName('button').namedItem('question-rate-button');
let rateSpan = rateButton.getElementsByTagName('span').item(0);
questionTitle.textContent = questionDetails.TITLE;
questionAskerName.textContent = questionDetails.ASKER_NAME;
rateSpan.textContent = questionDetails.RATE;
let question = new Quill(document.getElementsByTagName('div').namedItem('question'),
{
    modules:
    {
        toolbar: null
    },
    theme: 'snow'
});

question.setContents(questionDetails.CONTENT);
question.enable(false);

let editButton = document.getElementsByTagName('button').namedItem('question-edit-button');
let deleteButton = document.getElementsByTagName('button').namedItem('question-delete-button');

if(userId == null || questionDetails.ASKER_ID != userId)
{
    editButton.remove();
    deleteButton.remove();
}
else
{
    editButton.onclick = function()
    {
        if(editButton.textContent == 'Edit')
        {
            question.enable(true);

            editButton.textContent = 'Save';
        }
        else
        {
            editButton.setAttribute('disabled', '');
            UpdateQuestion(questionDetails.QUESTION_ID, question.getContents());
            question.enable(false);

            editButton.textContent = 'Edit';
            editButton.removeAttribute('disabled');
        }
    };

    deleteButton.onclick = function()
    {
        DeleteQuestion(questionDetails.QUESTION_ID);

        location.href = 'forumquestions.html';
    };
}

let answerTextArea = document.getElementsByTagName('input').namedItem('new-answer-text');
let answerForm = document.getElementsByTagName('form').namedItem('post-answer-form');

const SetupAnswers = async function()
{
    answerTextArea.value = '';

    let answersContainer = document.getElementsByTagName('div').namedItem('answers-container');
    let answersListUl = document.getElementsByTagName('ul').namedItem('answers-list');
    answersListUl.innerHTML = '';
    let answerListItemUI = await GetUIText('ui/ListItem/ForumAnswer.html');
    let response = GetAnswersFromQuestionId(questionDetails.QUESTION_ID, ['ANSWER_ID', 'QUESTION_ID', 'ANSWERER_ID', 'ANSWERER_NAME', 'ANSWER', 'TIME_OF_ANSWER', 'DATE_OF_ANSWER', 'RATE']);
    let emptyCard = document.createElement('div');

    emptyCard.classList.add('card', 'card-body');
    emptyCard.id = 'empty-card';

    emptyCard.textContent = 'Wow! Such empty';
    
    if(Array.isArray(response.answers))
    {
        if(answersListUl.style.visibility == 'hidden')
        {
            answersListUl.style.visibility = 'visible';

            let card = answersContainer.getElementsByTagName('div').namedItem('empty-card');

            card.remove();
        }

        for(let i = 0; i < response.answers.length; ++i)
        {
            let answerListItemWrapper = document.createElement('div');
            answerListItemWrapper.innerHTML = answerListItemUI;
            let answererPfp = answerListItemWrapper.getElementsByTagName('img').item(0);
            let answererName = answerListItemWrapper.getElementsByClassName('answerer-name').item(0);
            let answerDescription = answerListItemWrapper.getElementsByClassName('answer-description').item(0);
            let answerTime = answerListItemWrapper.getElementsByClassName('answer-time').item(0);
            let answerDate = answerListItemWrapper.getElementsByClassName('answer-date').item(0)
            let answerRateButton = answerListItemWrapper.getElementsByClassName('answer-rate-button').item(0);
            let answerRate = answerRateButton.getElementsByTagName('span').item(0);
            answererPfp.src = 'pfp/' + response.answers[i].ANSWERER_ID + '.png';
            answererName.textContent = response.answers[i].ANSWERER_NAME;
            answerDescription.textContent = response.answers[i].ANSWER;
            answerTime.textContent = response.answers[i].TIME_OF_ANSWER;
            answerDate.textContent = response.answers[i].DATE_OF_ANSWER;
            answerRate.textContent = response.answers[i].RATE;
            let menus = answerListItemWrapper.getElementsByClassName('menus').item(0);

            if(response.answers[i].ANSWERER_ID == userId)
            {
                let answerEdit = answerListItemWrapper.getElementsByClassName('answer-edit-button').item(0);
                let answerDelete = answerListItemWrapper.getElementsByClassName('answer-delete-button').item(0);

                answerEdit.onclick = function()
                {
                    answerSelected = response.answers[i].ANSWER_ID;
                    let answerEditModalInput = document.getElementsByTagName('input').namedItem('answer-edit-input');
                    answerEditModalInput.value = response.answers[i].ANSWER;
                };

                answerDelete.onclick = function()
                {
                    DeleteAnswer(response.answers[i].ANSWER_ID);
                    SetupAnswers();
                };
            }
            else
            {
                menus.setAttribute('disabled', '');
                
                menus.style.opacity = '0';
            }

            answerRateButton.onclick = function()
            {
                answerSelected = response.answers[i].ANSWER_ID;
                let individualAnswerRate = GetIndividualAnswerRate(userId, answerSelected);
                let answerRateModalInput = document.getElementsByTagName('input').namedItem('answer-rate-input');
                answerRateModalInput.value = individualAnswerRate.rate;
            };

            answersListUl.append(answerListItemWrapper.firstChild);
        }
    }
    else
    {
        answersListUl.style.visibility = 'hidden';
        
        answersContainer.append(emptyCard);
    }
};

SetupAnswers();

answerForm.onsubmit = function()
{
    let answerValue = answerTextArea.value;

    PostAnswer(userId, questionDetails.QUESTION_ID, answerValue);
    SetupAnswers();

    return false;
};

let answerEditModalElement = document.getElementsByTagName('div').namedItem('answer-edit-modal');
let answerEditModalInput = document.getElementsByTagName('input').namedItem('answer-edit-input');
let answerEditButton = document.getElementsByTagName('button').namedItem('answer-edit-button');
let answerEditModalForm = document.getElementsByTagName('form').namedItem('answer-edit-modal-form');
let answerEditModal = new bootstrap.Modal(document.getElementsByTagName('div').namedItem('answer-edit-modal'));

answerEditModalForm.onsubmit = function()
{
    answerEditModal.hide();
    UpdateAnswer(answerSelected, answerEditModalInput.value);
    SetupAnswers();

    return false;
};

let answerRateModalElement = document.getElementsByTagName('div').namedItem('answer-rate-modal');
let answerRateModalInput = document.getElementsByTagName('input').namedItem('answer-rate-input');
let answerRateUpdateButton = document.getElementsByTagName('button').namedItem('answer-rate-update-button');
let answerRateUpdateForm = document.getElementsByTagName('form').namedItem('answer-rate-update-form');
let answerRateModal = new bootstrap.Modal(answerRateModalElement);

answerRateUpdateForm.onsubmit = function()
{
    answerRateModal.hide();
    UpdateAnswerRate(userId, answerSelected, answerRateModalInput.value);
    SetupAnswers();

    return false;
};

let individualQuestionRate = GetIndividualQuestionRate(userId, questionDetails.QUESTION_ID);
let questionRateInput = document.getElementsByTagName('input').namedItem('question-rate-input');
let questionRateForm = document.getElementsByTagName('form').namedItem('question-rate-form');
let questionRateModalElement = document.getElementsByTagName('div').namedItem('question-rate-modal');
let questionRateModal = new bootstrap.Modal(questionRateModalElement);

questionRateModalElement.addEventListener('show.bs.modal', (event)=>
{
    questionRateInput.value = individualQuestionRate.rate;
});

questionRateForm.onsubmit = function()
{
    questionRateModal.hide();
    UpdateQuestionRate(userId, questionDetails.QUESTION_ID, questionRateInput.value);

    let questionRate = GetQuestionDetails(questionDetails.QUESTION_ID, ['RATE']);
    questionDetails.RATE = questionRate.RATE;
    individualQuestionRate.rate = questionRate.RATE;
    let questionRateTemp = document.getElementsByTagName('button').namedItem('question-rate-button').getElementsByTagName('span').item(0);
    questionRateTemp.textContent = questionDetails.RATE;

    return false;
};