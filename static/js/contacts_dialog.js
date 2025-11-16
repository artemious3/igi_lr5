document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('new-btn').addEventListener('click', () => {
    document.getElementById('dialog').showModal();
  });



function validateUrl(url){
  return /^http[s]:\/\/.*(\.php|\.html)$/.test(url);

}

function validatePhoneNumber(phone){
    return /((80\d\d|8 \(0\d\d\) )\d{7}|\+375 \(\d\d\) \d{3}[- ]\d{2}[- ]\d{2})/gm.test(phone);
}


  const form = document.getElementById('new-employee-form');
  form.addEventListener('submit', async (ev)=>{
    ev.preventDefault();
    const inputDialog = document.getElementById('dialog');
    const successDialog = document.getElementById('success-dialog');
    const failDialog = document.getElementById('fail-dialog');
    const errorMessages = document.getElementById('error-messages');
    errorMessages.innerHTML = '';


    let formData = new FormData(form);

    let err = false;

    if(!validatePhoneNumber(formData.get('phone_number'))){
      errorMessages.innerHTML += `<b>Phone number:</b> should be '80291112233', '8 (029) 1112233', '+375 (29) 111-22-33', '+375 (29) 111 22 33'\n`
      err = true;
      console.log('bad phone');
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
