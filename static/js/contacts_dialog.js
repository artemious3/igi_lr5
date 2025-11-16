
function validateUrl(url){
  return /^http[s]:\/\/.*(\.php|\.html)$/.test(url);

}

function validatePhoneNumber(phone){
    return /((80\d\d|8 \(0\d\d\) )\d{7}|\+375 \(\d\d\) \d{3}[- ]\d{2}[- ]\d{2})/gm.test(phone);
}

document.addEventListener('DOMContentLoaded', async () => {
  const dialog = document.getElementById('dialog');
  const inputElements = dialog.querySelectorAll('input,textarea');
  const form = document.getElementById('new-employee-form');
  const submitBtn = form.querySelector('input[type="submit"]');

  document.getElementById('new-btn').addEventListener('click', () => {
    dialog.showModal();
  });

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
    const inputDialog = document.getElementById('dialog');
    const successDialog = document.getElementById('success-dialog');
    const failDialog = document.getElementById('fail-dialog');
    const errorMessages = document.getElementById('error-messages');
    const phoneInput = document.querySelector('input[name="phone_number"');
    errorMessages.innerHTML = '';


    let formData = new FormData(form);

    let err = false;

    if(!validatePhoneNumber(formData.get('phone_number'))){
      errorMessages.innerHTML += `<b>Phone number:</b> should be '80291112233', '8 (029) 1112233', '+375 (29) 111-22-33', '+375 (29) 111 22 33'\n`
      err = true;
      phoneInput.dataset.invalid = "true";
    } else {
      phoneInput.dataset.invalid = "false";
    }


    if(err){
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
     gContactsSliceBuilder = resetDataSliceBuilder();
     addPager();
     selectPage(0);
     removeFilterAndSortIndication();

   } else {

     inputDialog.close();
     failDialog.showModal();

     const body = await resp.text();
     console.log(body);
   }

  })
});
