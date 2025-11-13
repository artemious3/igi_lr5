const API_ENDPOINT = '/service/api/contacts';

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
  data = null;

  static async fetchAndBuild(id){
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
        return new ContactsTable(id, employees_data);
      })
      .catch(e => {
        console.log(e);
        return null;
      });
  }

  constructor(id, data) {
    this.element = document.getElementById(id);
    this.data = data;
    this.show_data();
  }

  show_data(){
    for (let i = 0; i < this.data.length; i++){
      this.element.appendChild(this.data[i].intoTr());
    }
  }

}

let maybe_table = ContactsTable.fetchAndBuild("contacts");
if(maybe_table == null){
  document.getElementById("contacts").remove();
  document.body.append(`<p>Error. Try again later</p>`);
}
