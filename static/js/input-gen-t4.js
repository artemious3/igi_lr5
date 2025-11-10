let gInputCnt = 0;

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

  changer[1].addEventListener(event, function () {
    target_element.setAttribute(attr, changer[1].value);
  });

  return changer;
}


// @retunrs string
function addInteractiveInput(htmlElement) {
  const container = document.createElement("div");
  container.classList.add("input-container");

  const header = document.createElement("h2");
  header.innerHTML = "Input group " + (gInputCnt+1).toString();
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
  container.id = "ig" + gInputCnt.toString();

  const removeBtn = document.createElement("button");
  removeBtn.innerHTML = "Remove input group";
  const thisInputCnt = gInputCnt;
  removeBtn.addEventListener("click", ()=> {
    document.getElementById("ig" + thisInputCnt.toString()).remove();
  })
  container.appendChild(removeBtn);



  htmlElement.appendChild(container);

  gInputCnt++;
}

document.getElementById("input-add-btn").addEventListener("click", ()=>{
  addInteractiveInput(document.getElementById("inputs"));
})
