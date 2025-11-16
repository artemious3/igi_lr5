
function validateUrl(url){
  return /^http[s]:\/\/.*(\.php|\.html)$/.test(url);

}

function validatePhoneNumber(phone){
    return /((80\d\d|8 \(0\d\d\) )\d{7}|\+375 \(\d\d\) \d{3}[- ]\d{2}[- ]\d{2})/gm.test(phone);
}

function validateUrlAndPhoneInputs(formData){
  const errorMessages = document.getElementById('error-messages');
  const phoneInput = document.querySelector('input[name="phone_number"');
  const urlInput = document.querySelector('input[name="url"');

  let err = false;
  if(!validatePhoneNumber(formData.get('phone_number'))){
    errorMessages.innerHTML += `<p><b>Phone number:</b> must be '80291112233', '8 (029) 1112233', '+375 (29) 111-22-33', '+375 (29) 111 22 33'</p>`
    err = true;
    phoneInput.dataset.invalid = "true";
  } else {
    phoneInput.dataset.invalid = "false";
  }

  if(!validateUrl(formData.get('url'))){
    errorMessages.innerHTML += `<p><b>Url:</b> must start with http:// or https:// and end with .php or .html</p>`
    err = true;
    urlInput.dataset.invalid = "true";
  } else {
    urlInput.dataset.invalid = "false";
  }
  return !err;
}

async function refetchTable(){
  gContactsData = await fetchContacts();
  if (gContactsData === null) {
    document.getElementById("contacts").remove();
    document.body.append(`<p>Error. Try again later</p>`);
  }
  gContactsData = Array.from(gContactsData);
  gContactsSliceBuilder = resetDataSliceBuilder();
  addPager();
  selectPage(0);
  removeFilterAndSortIndication();
}

document.addEventListener('DOMContentLoaded', async () => {
  const dialog = document.getElementById('dialog');
  const inputElements = dialog.querySelectorAll('input,textarea');
  const form = document.getElementById('new-employee-form');
  const submitBtn = form.querySelector('input[type="submit"]');

  document.getElementById('new-btn').addEventListener('click', () => {
    dialog.showModal();
  });

  // submit button appears after all fields are filled
  dialog.addEventListener('input', async () => {
    let allNonEmpty = true;
    for (const inp of inputElements){
      allNonEmpty = allNonEmpty && Boolean(inp.value);
    }

    if(allNonEmpty){
      submitBtn.classList.add('shown');
      submitBtn.disabled = false;
    } else {
      submitBtn.classList.remove('shown');
      submitBtn.disabled = true;
    }
  });

  form.addEventListener('submit', async (ev)=>{
    ev.preventDefault();
    document.getElementById('error-messages').innerHTML = '';
    const inputDialog = document.getElementById('dialog');
    const successDialog = document.getElementById('success-dialog');
    const failDialog = document.getElementById('fail-dialog');

    let formData = new FormData(form);

    if(!validateUrlAndPhoneInputs(formData)){
      return;
    }

    let resp = await fetch(window.location.href,
      {
        method: "POST",
        body: formData
      });

   if(resp.ok) {
     inputDialog.close();
     successDialog.showModal();
     await refetchTable();
   } else {
     inputDialog.close();
     failDialog.showModal();
     const body = await resp.text();
     console.log(body);
   }

  })
});
