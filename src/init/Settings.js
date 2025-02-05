/**
 * @type {string | null}
 */
let userId = localStorage.getItem('user_id');
/**
 * @type {string | null}
 */
let student = localStorage.getItem('student');

if(userId == null)
{
    location.replace('index.html');
}

SetupNavBar(userId);

let interestsContainer = document.getElementsByTagName('div').namedItem('interests-container');
let specialitiesContainer = document.getElementsByTagName('div').namedItem('specialities-container');
let addTeacherButton = document.getElementsByTagName('button').namedItem('teacher-button');
let addStudentButton = document.getElementsByTagName('button').namedItem('student-button');

const SetupInterests = async function()
{
    let interestsResponse = GetStudentInterests(userId);
    let addInterestButton = document.getElementsByTagName('button').namedItem('add-interest-button');
    let addInterestForm = document.getElementsByTagName('form').namedItem('add-interest-form');
    
    if(interestsResponse.ok)
    {
        let interests = interestsResponse.interests;
        let interestsListContainer = document.getElementsByTagName('div').namedItem('interests-list-container');
        let interestsList = document.getElementsByTagName('div').namedItem('interests-list');
        interestsList.innerHTML = '';

        if(Array.isArray(interests))
        {
            for(let i = 0; i < interests.length; ++i)
            {
                let interestWrapper = document.createElement('div');
                interestWrapper.innerHTML = await GetUIText('ui/Interest.html');
                let span = interestWrapper.getElementsByTagName('span').item(0);
                span.textContent = interests[i];
                let deleteButton = interestWrapper.getElementsByTagName('a').item(0);
                deleteButton.onclick = function()
                {
                    DeleteInterest(userId, interests[i]);
                    SetupInterests();
                };
                
                if(interestsList.style.visibility == 'hidden')
                {
                    interestsList.style.visibility = 'visible';
                    let span = interestsListContainer.getElementsByTagName('span').item(0);

                    span.remove();
                }

                interestsList.append(interestWrapper.firstChild);
            }

            if(interests.length == 3)
            {
                addInterestButton.setAttribute('disabled', '');
            }
            else
            {
                addInterestButton.removeAttribute('disabled');
            }
        }
        else
        {
            interestsList.style.visibility = 'hidden';
            let interests = document.createElement('span');
            interests.style.color = '#21242ca3';
            interests.textContent = 'No interests ☹️';

            interestsListContainer.append(interests);
        }
    }

    addInterestForm.onsubmit = function()
    {
        let interest = document.getElementsByTagName('input').namedItem('new-interest-input');

        InsertInterest(userId, interest.value);

        interest.value = '';

        SetupInterests();

        return false;
    };
};

const SetupSpecialities = async function()
{
    let specialitiesResponse = GetTeacherSpecialities(userId);
    let specialitiesListContainer = document.getElementsByTagName('div').namedItem('specialities-list-container');
    let addSpecialityButton = document.getElementsByTagName('button').namedItem('add-speciality-button');
    let addSpecialityForm = document.getElementsByTagName('form').namedItem('add-speciality-form');
    
    if(specialitiesResponse.ok)
    {
        let specialities = specialitiesResponse.specialities;
        let specialitiesList = document.getElementsByTagName('div').namedItem('specialities-list');
        specialitiesList.innerHTML = '';

        if(Array.isArray(specialities))
        {
            for(let i = 0; i < specialities.length; ++i)
            {
                let specialityWrapper = document.createElement('div');
                specialityWrapper.innerHTML = await GetUIText('ui/Speciality.html');
                let span = specialityWrapper.getElementsByTagName('span').item(0);
                span.textContent = specialities[i];
                let deleteButton = specialityWrapper.getElementsByTagName('a').item(0);
                deleteButton.onclick = function()
                {
                    DeleteSpeciality(userId, specialities[i]);
                    SetupSpecialities();
                };

                if(specialitiesList.style.visibility == 'hidden')
                {
                    specialitiesList.style.visibility = 'visible';
                    let span = specialitiesListContainer.getElementsByTagName('span').item(0);

                    span.remove();
                }

                specialitiesList.append(specialityWrapper.firstChild);
            }

            if(specialities.length == 3)
            {
                addSpecialityButton.setAttribute('disabled', '');
            }
            else
            {
                addSpecialityButton.removeAttribute('disabled');
            }
        }
        else
        {
            specialitiesList.style.visibility = 'hidden';
            let specialities = document.createElement('span');
            specialities.style.color = '#21242ca3';
            specialities.textContent = 'No specialities ☹️';

            specialitiesListContainer.append(specialities);
        }
    }

    addSpecialityForm.onsubmit = function()
    {
        let speciality = document.getElementsByTagName('input').namedItem('new-speciality-input');

        InsertSpeciality(userId, speciality.value);

        speciality.value = '';

        SetupSpecialities();

        return false;
    };
};

if(student == 'true')
{
    specialitiesContainer.remove();
    addStudentButton.remove();
    SetupInterests();

    let teacher = GetTeacherDetailsFromUserId(userId, ['USER_ID']);

    if(teacher.USER_ID == null)
    {
        addTeacherButton.onclick = function()
        {
            InsertTeacher(userId);
            addTeacherButton.remove();
        };
    }
    else
    {
        addTeacherButton.remove();
    }
}
else
{
    interestsContainer.remove();
    addTeacherButton.remove();
    SetupSpecialities();

    let student = GetStudentDetailsFromUserId(userId, ['USER_ID']);

    if(student.USER_ID == null)
    {
        addStudentButton.onclick = function()
        {
            InsertStudent(userId);
            addStudentButton.remove();
        };
    }
    else
    {
        addStudentButton.remove();
    }
}

let userDetails = GetUserDetails(userId, ['FULL_NAME', 'EMAIL', 'BIO', 'DATE_OF_BIRTH', 'SECURITY_KEY']);
let fullName = document.getElementsByTagName('input').namedItem('full-name');
let email = document.getElementsByTagName('input').namedItem('email');
let password = document.getElementsByTagName('input').namedItem('password');
let bio = document.getElementsByTagName('textarea').namedItem('bio');
let pfp = document.getElementsByTagName('img').namedItem('pfp');
let pfpFile = document.getElementsByTagName('input').namedItem('pfp-file');
let dateOfBirth = document.getElementsByTagName('input').namedItem('date-of-birth');
fullName.value = userDetails.FULL_NAME;
email.value = userDetails.EMAIL;
password.value = userDetails.SECURITY_KEY;
bio.value = userDetails.BIO;
dateOfBirth.valueAsDate = new Date(userDetails.DATE_OF_BIRTH);
pfp.src = 'pfp/' + userId + '.png';

let saveButton = document.getElementsByTagName('button').namedItem('save-button');
saveButton.onclick = async function()
{
    saveButton.setAttribute('disabled', '');

    let fullNameValue = fullName.value;
    let emailValue = email.value;
    let passwordValue = password.value;
    let bioValue = bio.value;
    let dateValue = dateOfBirth.valueAsDate.getFullYear() + '-' + (dateOfBirth.valueAsDate.getMonth() + 1).toString() + '-' + dateOfBirth.valueAsDate.getDate();
    let imageUploadSuccess = true;

    if(pfpFile.files.length > 0)
    {
        let file = pfpFile.files.item(0);

        let pfpResponse = await UpdatePfp(userId, file);

        if(!pfpResponse.pfp_updated)
        {
            imageUploadSuccess = false;
        }
    }

    if(imageUploadSuccess)
    {
        let response = UpdateUserDetails(userId, fullNameValue, emailValue, passwordValue, bioValue, dateValue);

        if(response.return == 0)
        {
            if(student == 'true')
            {
                location.href = 'student.html';
            }
            else
            {
                location.href = 'teacher.html';
            }
        }
        else if(response.return == 1)
        {
            let toastElement = document.getElementById('empty-name-toast');
            let toast = new bootstrap.Toast(toastElement);

            toast.show();
        }
        else if(response.return == 2)
        {
            let toastElement = document.getElementById('empty-email-toast');
            let toast = new bootstrap.Toast(toastElement);

            toast.show();        }
        else if(response.return == 3)
        {
            let toastElement = document.getElementById('invalid-email-address-toast');
            let toast = new bootstrap.Toast(toastElement);

            toast.show();
        }
        else
        {
            let toastElement = document.getElementById('invalid-password-toast');
            let toast = new bootstrap.Toast(toastElement);

            toast.show();
        }
    }
    else
    {
        let toastElement = document.getElementById('invalid-pfp');
        let toast = new bootstrap.Toast(toastElement);

        toast.show();
    }

    saveButton.removeAttribute('disabled');
}