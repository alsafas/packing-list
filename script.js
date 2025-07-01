// Default categories data (used when person has no saved data yet)
const SHEETDB_API_URL = "https://sheetdb.io/api/v1/pn72a5c2hc75l";

const defaultCategories = {
  "Travel Essentials": [
    ["Phone charger + power bank", "Bring all 3, power bank at least 10,000 mAh"],
    ["Travel adapter", "Type C or E, 220V"],
    ["Passport + copies", "Print and keep digital copy too"],
    ["Wallet with ID, cards, and cash", "Bring some SYP or USD"],
    ["Sunscreen", "SPF 30+ recommended"],
    ["Sunglasses", "Polarized if possible"],
    ["Reusable water bottle", "Leakproof for travel"],
    ["Headphones/earbuds", "Wired or wireless"],
    ["Snacks", "Protein bars, nuts, gum"],
    ["2–3 masks", "Optional, if needed"]
  ],
  "Clothing": [
    ["5–6 breathable tops", "Light cotton/linen, short & long sleeve mix"],
    ["3–4 lightweight pants", "Loose or wide-leg for comfort"],
    ["2 modest dresses or abayas", "Optional for outings or gatherings"],
    ["1 cardigan or kimono", "Lightweight for layering"],
    ["2 sets of PJs/loungewear", "Cotton or breathable material"],
    ["1 swimsuit", "Only for private swimming settings"],
    ["1 light scarf or shawl", "For sun or religious sites"],
    ["6–8 pairs of socks", "Cotton preferred"],
    ["7–9 underwear", "Bring a few extras due to heat"],
    ["1 pair walking shoes", "Sneakers or comfy sandals"],
    ["1 pair breathable sandals", "Good for hot days"],
    ["1 pair indoor slippers", "For home use"]
  ],
  "Toiletries": [
    ["Toothbrush + toothpaste", "Travel size or full size"],
    ["Face wash + moisturizer", "Light formulas for summer"],
    ["Bar soap or body wash", "Solid is travel-friendly"],
    ["Shampoo + conditioner", "Small bottles or bars"],
    ["Hairbrush + 5–6 hair ties", "Wide-tooth brush if you have thick hair"],
    ["Deodorant", "Aluminum-free if you prefer"],
    ["Razor", "Pack extra blades if needed"],
    ["Nail clippers + tweezers", "Useful for grooming"],
    ["1 pack of tissues", "Small travel packs"],
    ["1 small pack of wipes", "Antibacterial or general"],
    ["Perfume or spray", "Optional"],
    ["Pads/tampons", "Bring full cycle's worth"],
    ["Hand sanitizer", "Pocket-sized"]
  ],
  "Skincare/Makeup": [
    ["Light makeup", "BB cream, powder, mascara, etc."],
    ["Makeup remover", "Wipes or micellar water"],
    ["Lip balm", "Preferably with SPF"],
    ["Night cream or AHA", "Only if you already use it"],
    ["Makeup brushes", "Only essentials"]
  ],
  "Other Items": [
    ["Small backpack or tote", "For outings and carry-ons"],
    ["Crossbody bag", "More secure than shoulder bags"],
    ["Small lock", "For luggage or zippers"],
    ["Laundry/plastic bag", "For dirty clothes"],
    ["Notebook + pen", "For journaling or contact info"],
    ["Small gifts", "Optional for family/friends"]
  ]
};

let currentPerson = "";
let familyMembers = ["Shahd", "Mama", "Baba", "Nour", "Eman"];

// === Family Members Rendering & Controls ===
function renderFamilyButtons() {
  const container = document.getElementById("member-buttons");
  container.innerHTML = "";
  familyMembers.forEach(name => {
    const wrapper = document.createElement("div");
    wrapper.className = "member-wrapper";

    const btn = document.createElement("button");
    btn.textContent = name;
    btn.className = "member-main";
    btn.onclick = () => loadChecklist(name);

    const edit = document.createElement("button");
    edit.textContent = "✏️";
    edit.className = "edit-btn";
    edit.onclick = () => editMember(name);

    const del = document.createElement("button");
    del.textContent = "🗑️";
    del.className = "delete-btn";
    del.onclick = () => deleteMember(name);

    wrapper.appendChild(btn);

    const btnRow = document.createElement("div");
    btnRow.style.display = "flex";
    btnRow.style.justifyContent = "center";
    btnRow.style.gap = "10px";

    btnRow.appendChild(edit);
    btnRow.appendChild(del);

    wrapper.appendChild(btnRow);

    container.appendChild(wrapper);
  });
}

// Load categories for person from localStorage or default
async function loadCategoriesForPerson(person) {
  try {
    const res = await fetch(`${SHEETDB_API_URL}/search?person=${person}&type=categories`);
    const data = await res.json();
    if (data.length > 0) {
      return JSON.parse(data[data.length - 1].data);
    } else {
      return JSON.parse(JSON.stringify(defaultCategories));
    }
  } catch {
    return JSON.parse(JSON.stringify(defaultCategories));
  }
}

// Save categories to localStorage for person
function saveCategoriesForPerson(person, categories) {
  fetch(SHEETDB_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: [{
        person: person,
        type: "categories",
        data: JSON.stringify(categories)
      }]
    })
  }).catch(console.error);
}


// Load checked state for person
async function loadCheckedForPerson(person) {
  try {
    const res = await fetch(`${SHEETDB_API_URL}/search?person=${person}&type=checked`);
    const data = await res.json();
    if (data.length > 0) {
      return JSON.parse(data[data.length - 1].data);
    } else {
      return {};
    }
  } catch {
    return {};
  }
}

// Save checked state for person
function saveCheckedForPerson(person, checked) {
  fetch(SHEETDB_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: [{
        person: person,
        type: "checked",
        data: JSON.stringify(checked)
      }]
    })
  }).catch(console.error);
}

// Main function to load checklist UI for a person
async function loadChecklist(person) {
  currentPerson = person;
  document.getElementById("add-member-btn").style.display = "none";
  document.getElementById("person-heading").textContent = `${person}'s Packing List`;
  document.getElementById("member-buttons").style.display = "none";
  document.getElementById("list-container").style.display = "flex";
  document.querySelectorAll('.back-btn').forEach(btn => btn.style.display = 'block');
  document.querySelector('button.clear-btn').style.display = "inline-block";
  document.getElementById("congrats").style.display = "none";

  document.getElementById("controls").style.display = "block";

  createList();
}

async function createList() {
  const container = document.getElementById("list-container");
  container.innerHTML = "";

  // Load categories and checked for current person
  let categories = await loadCategoriesForPerson(currentPerson);
  let savedChecked = await loadCheckedForPerson(currentPerson);

  let allChecked = true;

  for (const category in categories) {
    const section = document.createElement("div");
    section.className = "category";

    // Title & check all button
    const headerDiv = document.createElement("div");
    headerDiv.style.display = "flex";
    headerDiv.style.alignItems = "center";
    headerDiv.style.justifyContent = "space-between";
    headerDiv.style.flexWrap = "wrap";
    headerDiv.style.gap = "10px"; // optional for spacing

    const title = document.createElement("h2");
    title.textContent = category;

    const checkAllBtn = document.createElement("button");
    checkAllBtn.className = "check-all-btn";
    checkAllBtn.textContent = "Check All";
    checkAllBtn.onclick = () => {
      categories[category].forEach(([item]) => {
        savedChecked[item] = true;
      });
      saveCheckedForPerson(currentPerson, savedChecked);
      createList();
    };

    
    const deleteCategoryBtn = document.createElement("button");
    deleteCategoryBtn.textContent = "🗑️";
    deleteCategoryBtn.className = "delete-category-btn";
    deleteCategoryBtn.title = "Delete this category";
    deleteCategoryBtn.onclick = () => {
        if (confirm(`Delete category "${category}"? This will remove all items under it.`)) {
            delete categories[category];
            saveCategoriesForPerson(currentPerson, categories);
            createList();
        }
    };

    // Create toggle button BEFORE appending headerDiv
    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = "🔽";
    toggleBtn.className = "toggle-category-btn";
    toggleBtn.title = "Collapse/Expand";

    toggleBtn.onclick = () => {
        const isCollapsed = section.classList.toggle("collapsed");
        toggleBtn.textContent = isCollapsed ? "▶️" : "🔽";
    };

    // Append header elements
    headerDiv.appendChild(title);
    headerDiv.appendChild(checkAllBtn);
    headerDiv.appendChild(deleteCategoryBtn);
    headerDiv.appendChild(toggleBtn);

    // Append header to section
    section.appendChild(headerDiv);



    let categoryDone = true;

    // Add BEFORE categories[category].forEach(...) loop:
    const categoryContent = document.createElement("div");
    categoryContent.className = "category-content";
    categoryContent.style.display = "flex";
    categoryContent.style.flexDirection = "column";
    categoryContent.style.gap = "6px";
    categoryContent.style.width = "100%";

    // List each item with editable name, note, checkbox, and delete button
    categories[category].forEach(([item, note], index) => {
      const label = document.createElement("label");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = savedChecked[item] || false;
      checkbox.onchange = () => {
        savedChecked[item] = checkbox.checked;
        saveCheckedForPerson(currentPerson, savedChecked);
        createList();
      };
      if (!checkbox.checked) categoryDone = false;

      // Editable item name span
      const itemSpan = document.createElement("span");
      itemSpan.textContent = item;
      itemSpan.contentEditable = true;
      itemSpan.className = "editable-item";
      itemSpan.spellcheck = false;
      itemSpan.addEventListener("blur", () => {
        const newItemName = itemSpan.textContent.trim();
        if (newItemName === "") {
          // revert if empty
          itemSpan.textContent = item;
          return;
        }
        if (newItemName !== item) {
          // Update categories key
          categories[category][index][0] = newItemName;

          // Update checked keys: remove old, keep value on new key
          if (savedChecked[item] !== undefined) {
            savedChecked[newItemName] = savedChecked[item];
            delete savedChecked[item];
            saveCheckedForPerson(currentPerson, savedChecked);
          }

          saveCategoriesForPerson(currentPerson, categories);
          createList(); // refresh UI to reflect changes
        }
      });

      // Editable note span
      const noteSpan = document.createElement("span");
      noteSpan.textContent = note || "";
      noteSpan.contentEditable = true;
      noteSpan.className = "editable-note";
      noteSpan.spellcheck = false;
      noteSpan.addEventListener("blur", () => {
        const newNote = noteSpan.textContent.trim();
        if (newNote !== note) {
          categories[category][index][1] = newNote;
          saveCategoriesForPerson(currentPerson, categories);
        }
      });

      // Delete button for item
      const delBtn = document.createElement("button");
      delBtn.textContent = "✖";
      delBtn.title = "Delete this item";
      delBtn.className = "item-delete-btn";
      delBtn.onclick = () => {
        if (confirm(`Delete "${item}" from ${category}?`)) {
          categories[category].splice(index, 1);
          // Remove from checked too
          if (savedChecked[item] !== undefined) {
            delete savedChecked[item];
            saveCheckedForPerson(currentPerson, savedChecked);
          }
          saveCategoriesForPerson(currentPerson, categories);
          createList();
        }
      };

      // Row container
      const rowDiv = document.createElement("div");
      rowDiv.style.display = "flex";
      rowDiv.style.alignItems = "center";
      rowDiv.style.justifyContent = "space-between";
      rowDiv.style.width = "100%";
      rowDiv.style.gap = "6px";

      // Left section: checkbox + item name
      const leftDiv = document.createElement("div");
      leftDiv.style.display = "flex";
      leftDiv.style.alignItems = "center";
      leftDiv.style.gap = "10px";
      leftDiv.appendChild(checkbox);
      leftDiv.appendChild(itemSpan);

      // Add left section and delete button
      rowDiv.appendChild(leftDiv);
      rowDiv.appendChild(delBtn);

      // Add rows to label
      label.appendChild(rowDiv);
      label.appendChild(noteSpan);

      categoryContent.appendChild(label);
      
    });

    // Add new item input + button for this category
    const addItemDiv = document.createElement("div");
    addItemDiv.className = "add-item-container";

    const newItemInput = document.createElement("input");
    newItemInput.type = "text";
    newItemInput.placeholder = "New item name";
    newItemInput.maxLength = 60;
    newItemInput.autocomplete = "off";

    const newNoteInput = document.createElement("input");
    newNoteInput.type = "text";
    newNoteInput.placeholder = "Optional note";
    newNoteInput.maxLength = 100;
    newNoteInput.autocomplete = "off";

    const addBtn = document.createElement("button");
    addBtn.textContent = "+ Add Item";
    addBtn.onclick = () => {
      const newItemName = newItemInput.value.trim();
      const newNote = newNoteInput.value.trim();

      if (!newItemName) {
        alert("Item name cannot be empty");
        return;
      }

      // Check duplicate names in this category
      const exists = categories[category].some(([itemName]) => itemName.toLowerCase() === newItemName.toLowerCase());
      if (exists) {
        alert("This item already exists in the category");
        return;
      }

      categories[category].push([newItemName, newNote]);
      saveCategoriesForPerson(currentPerson, categories);
      newItemInput.value = "";
      newNoteInput.value = "";
      createList();
    };

    addItemDiv.appendChild(newItemInput);
    addItemDiv.appendChild(newNoteInput);
    addItemDiv.appendChild(addBtn);

    categoryContent.appendChild(addItemDiv);
    section.appendChild(categoryContent);

    if (categoryDone && categories[category].length > 0) {
      section.classList.add("done");
    } else {
      section.classList.remove("done");
      allChecked = false;
    }

    container.appendChild(section);
  }

  if (allChecked && Object.keys(categories).length > 0) {
    document.getElementById("congrats").style.display = "block";
  } else {
    document.getElementById("congrats").style.display = "none";
  }
}

function clearAll() {
  if (currentPerson) {
    localStorage.removeItem("packingList_" + currentPerson);
    createList();
  }
}

function goBack() {
  currentPerson = "";
  document.getElementById("member-buttons").style.display = "flex";
  document.getElementById("list-container").style.display = "none";
  document.querySelectorAll('.back-btn').forEach(btn => btn.style.display = 'none');

  document.querySelector('button.clear-btn').style.display = "none";
  document.getElementById("controls").style.display = "none";
  
  
  document.getElementById("congrats").style.display = "none";
  document.getElementById("person-heading").textContent = "";
  document.getElementById("add-member-btn").style.display = "block";
}

function addFamilyMember() {
  const name = prompt("Enter family member name:");
  if (name && name.trim() !== "") {
    const trimmed = name.trim();
    if (familyMembers.includes(trimmed)) {
      alert("This member already exists");
      return;
    }
    familyMembers.push(trimmed);
    renderFamilyButtons();
  }
}

function deleteMember(name) {
  if (confirm(`Delete ${name}?`)) {
    familyMembers = familyMembers.filter(n => n !== name);
    localStorage.removeItem("packingList_" + name);
    localStorage.removeItem("categories_" + name);
    renderFamilyButtons();
    if(currentPerson === name) goBack();
  }
}

function editMember(name) {
  const newName = prompt("Edit name:", name);
  if (newName && newName.trim() !== "" && newName !== name) {
    const trimmed = newName.trim();
    if (familyMembers.includes(trimmed)) {
      alert("A member with this name already exists");
      return;
    }
    // Rename localStorage keys if exists
    const savedPacking = localStorage.getItem("packingList_" + name);
    if (savedPacking) {
      localStorage.setItem("packingList_" + trimmed, savedPacking);
      localStorage.removeItem("packingList_" + name);
    }
    const savedCategories = localStorage.getItem("categories_" + name);
    if (savedCategories) {
      localStorage.setItem("categories_" + trimmed, savedCategories);
      localStorage.removeItem("categories_" + name);
    }
    familyMembers = familyMembers.map(n => n === name ? trimmed : n);
    renderFamilyButtons();
    if(currentPerson === name) {
      currentPerson = trimmed;
      loadChecklist(trimmed);
    }
  }
}

// === Shared Notes Persistence ===
const sharedNotes = document.getElementById("shared-notes");

// Load notes from localStorage on load
sharedNotes.innerHTML = localStorage.getItem("sharedNotes") || "<p>Write your shared notes here...</p>";

// Save notes on input
sharedNotes.addEventListener("input", () => {
    localStorage.setItem("sharedNotes", sharedNotes.innerHTML);
});

// === Back to Top Button ===
const backToTopBtn = document.getElementById("back-to-top-btn");

// Show button when scrolling down
window.addEventListener("scroll", () => {
    if (document.body.scrollTop > 250 || document.documentElement.scrollTop > 250) {
        backToTopBtn.style.display = "block";
    } else {
        backToTopBtn.style.display = "none";
    }
});

// Scroll to top on click
backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

document.getElementById("add-category-btn").addEventListener("click", () => {
    const categoryName = prompt("Enter new category name:");
    if (categoryName && categoryName.trim() !== "") {
        const trimmed = categoryName.trim();
        let categories = loadCategoriesForPerson(currentPerson);
        if (categories[trimmed]) {
            alert("This category already exists.");
            return;
        }
        categories[trimmed] = [];
        saveCategoriesForPerson(currentPerson, categories);
        createList();
    }
});


// Initial render
renderFamilyButtons();
goBack();
