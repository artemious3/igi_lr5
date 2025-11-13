const API_ENDPOINT = '/service/api/contacts';
const TABLE_ELEMENT_ID = "contacts";


class DataSliceBuilder{

  data = null;
  slice = null;

  constructor(data){
    this.data = data.slice();
  }

  sortBy(propertyName, desc){
    this.data.sort((a,b)=> {
      if(a[propertyName] < b[propertyName]){
        return desc ? +1 : -1;
      } else if (a[propertyName] > b[propertyName]){
        return desc ? -1 : +1;
      }
      return 0;
    })
    return this;
  }

  filterBy(propertyName, filter){
    this.data = this.data.filter((item) => item[propertyName].toString().includes(filter));
    return this;
  }

  goToPage(page, itemsPerPage){
    this.slice = this.data.slice(itemsPerPage * page, itemsPerPage * (page + 1));
    return this;
  }

  length(){
    return this.build().length();
  }

  build(){
    if(this.slice === null){
      return this.data;
    }
    return this.slice;
  }

}

class Employee {

  phone_number = null;
  image = null;
  specification = null;
  first_name = null;
  last_name = null;
  email = null;
  selected = false;
  index = null;


  static fromJson(obj){
    let emp = new Employee();
    emp.phone_number = obj.phone_number;
    emp.image = obj.image;
    emp.specification = obj.specification;
    emp.first_name = obj.user.first_name;
    emp.last_name = obj.user.last_name;
    emp.email = obj.user.email;
    emp.selected = false;
    return emp;
  }

  intoTr(){
    let tr = document.createElement("tr");

    function createTd(content){
      let td = document.createElement("td");
      td.innerHTML = content;
      return td
    }

    tr.appendChild(createTd(`<input type="checkbox"
                              data-idx=${this.index}
                              ${this.selected ? "checked" : ""}>`));
    tr.appendChild(createTd(`<img src="${this.image}">`));
    tr.appendChild(createTd(this.first_name));
    tr.appendChild(createTd(this.last_name));
    tr.appendChild(createTd(this.email));
    tr.appendChild(createTd(this.phone_number));
    tr.appendChild(createTd(this.specification));

    return tr;
  }

}

class ContactsTable {

  element = null;
  shownData = null;

  constructor(id, data) {
    this.element = document.getElementById(id);
    this.shownData = data;
    this.clear_data();
    this.show_data();
  }

  clear_data(){
    this.element.querySelectorAll("tbody tr").forEach((tr)=> {
      tr.remove();
    })
  }

  show_data(){
    for (let i = 0; i < this.shownData.length; i++){
      this.element.querySelector("tbody").appendChild(this.shownData[i].intoTr());
    }
  }

  set_data(newData){
    this.shownData = newData;
    this.clear_data();
    this.show_data();
  }

}

async function fetchContacts(id){
  return fetch(API_ENDPOINT)
    .then(async response => {
      if (!response.ok) {
        throw new Error(`HTTP error. Status : ${response.status} - ${response.statusText}`);
      }
      let employees_data =  (await response.json()).employees.map((emp, idx) => {
        let employee = Employee.fromJson(emp);
        employee.index = idx;
        return employee;
      });
      return employees_data;
    })
    .catch(e => {
      console.log(e);
      return null;
    });
}



let gContactsData = null;
let gContactsSliceBuilder = null;

function resetDataSliceBuilder(){
  return new DataSliceBuilder(gContactsData);
}


function addSortOnClick(element){

  let clickCounter = 0;

  function buildIcon(down){
    let i = document.createElement("i");
    i.classList.add("fa-solid");
    i.classList.add(down ? "fa-sort-down" : "fa-sort-up");
    i.id = "sort-icon";
    return i;
  }

  element.addEventListener('click', ()=>{

    let sortIcon = document.getElementById("sort-icon");
    let desc = false;
    if(sortIcon != null){
      sortIcon.remove();
    }
    if(clickCounter == 0){
      element.appendChild(buildIcon(false));
      clickCounter = 1;
    } else if (clickCounter == 1){
      element.appendChild(buildIcon(true));
      clickCounter = 2;
      desc = true;
    } else {
      clickCounter = 0;
      new ContactsTable(TABLE_ELEMENT_ID, gContactsData);
      return;
    }

    let sortedData =
        gContactsSliceBuilder
        .sortBy(element.dataset.prop, desc)
        .build();
    new ContactsTable(TABLE_ELEMENT_ID, sortedData);
  })

}


function addFilters(element){
  function buildButton(){
    let i = document.createElement("i");
    i.classList.add("fa-solid");
    i.classList.add("fa-filter");
    let btn = document.createElement("button");
    btn.appendChild(i);
    return btn;
  }

  let btn = buildButton();
  element.appendChild(btn);

  let filterInput = document.getElementById("filter-input");

  btn.addEventListener('click', (ev)=> {
    ev.stopPropagation();
    if(btn.id == "filter-btn-active"){
      new ContactsTable(TABLE_ELEMENT_ID, gContactsData);
      btn.id = "";
      return;
    }
    let activeFiler = document.getElementById("filter-btn-active");
    if(activeFiler != null){
      activeFiler.id = "";
    }
    btn.id = "filter-btn-active";

    gContactsSliceBuilder = resetDataSliceBuilder();
    let filteredData =
      gContactsSliceBuilder
      .filterBy(element.dataset.prop, filterInput.value)
        .build();
    new ContactsTable(TABLE_ELEMENT_ID, filteredData);
  })
}

document.addEventListener('DOMContentLoaded', async () => {

  gContactsData = await fetchContacts();
  if (gContactsData === null) {
    document.getElementById("contacts").remove();
    document.body.append(`<p>Error. Try again later</p>`);
  }
  gContactsData = Array.from(gContactsData);

  gContactsSliceBuilder = new DataSliceBuilder(gContactsData);
  new ContactsTable(TABLE_ELEMENT_ID, gContactsData);

  // and then set up buttons for sorting and filter
  document.getElementById(TABLE_ELEMENT_ID)
    .querySelectorAll("thead td")
    .forEach((td) => {
      addSortOnClick(td);
      addFilters(td);
    });


})
