let gInputCnt = 0;
let gInputStates = {};

function createInput(label, type) {
  let label_element = document.createElement("label");
  label_element.innerHTML += "<p>" + label + "</p>";
  label_element.classList.add("input-label");

  let input = document.createElement("input");
  input.type = type;
  label_element.append(input);
  return [label_element, input];
}

function createAttributeChanger(label, type, target_element, event, attr) {
  let changer = createInput(label, type);
  changer[1].dataset.attr = attr;

  changer[1].addEventListener(event, function () {
    target_element.setAttribute(attr, changer[1].value);
  });

  return changer;
}


let attributes_order = [
  "name", "min", "max", "step", "value", "placeholder"
]

function addInteractiveInput(htmlElement,id) {
  const container = document.createElement("div");
  container.classList.add("input-container");

  const header = document.createElement("h2");
  header.innerHTML = "Input group " + (id+1).toString();
  container.appendChild(header);

  let element = createInput("Interactive input: ", "number");
  let nameChanger = createAttributeChanger(
    "Name: ",
    "text",
    element[1],
    "input",
    "name",
  );
  let minChanger = createAttributeChanger(
    "Min: ",
    "number",
    element[1],
    "input",
    "min",
  );
  let maxChanger = createAttributeChanger(
    "Max: ",
    "number",
    element[1],
    "input",
    "max",
  );
  let stepChanger = createAttributeChanger(
    "Step: ",
    "number",
    element[1],
    "input",
    "step",
  );
  let valueChanger = createAttributeChanger(
    "Value: ",
    "number",
    element[1],
    "input",
    "value",
  );
  let placeholderChanger = createAttributeChanger(
    "Placeholder: ",
    "text",
    element[1],
    "input",
    "placeholder",
  );

  let readonlyChanger = createInput("Readonly:", "checkbox");

  readonlyChanger[1].addEventListener("input", function (el) {
    if (this.checked) {
      element[1].setAttribute("readonly", "");
    } else {
      element[1].removeAttribute("readonly");
    }
  });

  container.append(
    element[0],
    nameChanger[0],
    minChanger[0],
    maxChanger[0],
    stepChanger[0],
    valueChanger[0],
    placeholderChanger[0],
    readonlyChanger[0],
  );
  container.id = "ig" + id.toString();

  const removeBtn = document.createElement("button");
  removeBtn.innerHTML = "Remove input group";
  const thisInputCnt = id;
  removeBtn.addEventListener("click", ()=> {
    document.getElementById("ig" + thisInputCnt.toString()).remove();
    delete gInputStates[id];
  })
  container.appendChild(removeBtn);

  htmlElement.appendChild(container);

  container.addEventListener('input', () => { updateInputGroup(id)});

  return container;
}

function updateInputGroup(id){
  const igroup = document.getElementById("ig" + id.toString());
  if(igroup == null){
    return;
  }
  let values = Array.from(igroup.getElementsByTagName('input')).map((el) => el.value);
  gInputStates[id] = values;
}

function storeInputs(){
  let state = {
    "gInputCnt": gInputCnt,
    "gInputStates": gInputStates
  };
  localStorage.setItem('interactive_input', JSON.stringify(state));
}

function restoreInputs(){
  let state = JSON.parse(localStorage.getItem('interactive_input'));
  if(state == null){
    return;
  }
  gInputCnt = state["gInputCnt"];
  gInputStates = state["gInputStates"];

  const container = document.getElementById('inputs');
  for (let id in gInputStates){
    let restoredInput = addInteractiveInput(container, +id);
    let inputs = restoredInput.getElementsByTagName('input');

    for (let i = 0; i < inputs.length; i++){
      inputs[i].value = gInputStates[id][i];
    }

    for (let i = 1; i < inputs.length-1; i++){
      inputs[0].setAttribute(inputs[i].dataset.attr, inputs[i].value);
    }
  }
}


document.addEventListener('DOMContentLoaded', () => {
  restoreInputs();
  document.getElementById("input-add-btn").addEventListener("click", ()=>{
    addInteractiveInput(document.getElementById("inputs"),gInputCnt);
    updateInputGroup(gInputCnt);
    gInputCnt++;
  })
});

window.addEventListener('beforeunload', storeInputs);
