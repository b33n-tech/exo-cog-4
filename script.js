const jalonsList = document.getElementById("jalonsList");
const messagesTable = document.querySelector("#messagesTable tbody");
const rdvList = document.getElementById("rdvList");
const autresList = document.getElementById("autresList");
const uploadJson = document.getElementById("uploadJson");
const loadBtn = document.getElementById("loadBtn");
const uploadStatus = document.getElementById("uploadStatus");

const generateMailBtn = document.getElementById("generateMailBtn");
const mailPromptSelect = document.getElementById("mailPromptSelect");

// Bibliothèque de prompts pour mails
const mailPrompts = {
  1: "Écris un email professionnel clair et concis pour :",
  2: "Écris un email amical et léger pour :"
};

let llmData = null;

// --- Fonction render ---
function renderModules() {
  // --- Jalons ---
  jalonsList.innerHTML = "";
  if(llmData?.jalons){
    llmData.jalons.forEach(j => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${j.titre}</strong> (${j.datePrévue})`;
      if(j.sousActions?.length){
        const subUl = document.createElement("ul");
        j.sousActions.forEach(s => {
          const subLi = document.createElement("li");
          const cb = document.createElement("input");
          cb.type="checkbox";
          cb.checked = s.statut==="fait";
          cb.addEventListener("change", ()=> s.statut = cb.checked ? "fait":"à faire");
          subLi.appendChild(cb);
          subLi.appendChild(document.createTextNode(s.texte));
          subUl.appendChild(subLi);
        });
        li.appendChild(subUl);
      }
      jalonsList.appendChild(li);
    });
  }

  // --- Messages ---
  messagesTable.innerHTML = "";
  if(llmData?.messages){
    llmData.messages.forEach((m,i)=>{
      const tr = document.createElement("tr");
      const tdCheck = document.createElement("td");
      const cb = document.createElement("input");
      cb.type="checkbox";
      cb.checked = m.envoyé;
      cb.addEventListener("change", ()=> m.envoyé = cb.checked);
      tdCheck.appendChild(cb);
      tr.appendChild(tdCheck);
      tr.appendChild(document.createElement("td")).textContent = m.destinataire;
      tr.appendChild(document.createElement("td")).textContent = m.sujet;
      tr.appendChild(document.createElement("td")).textContent = m.texte;
      messagesTable.appendChild(tr);
    });
  }

  // --- RDV ---
  rdvList.innerHTML = "";
  if(llmData?.rdv){
    llmData.rdv.forEach(r=>{
      const li = document.createElement("li");
      li.innerHTML = `<strong>${r.titre}</strong> - ${r.date} (${r.durée}) - Participants: ${r.participants.join(", ")})`;
      rdvList.appendChild(li);
    });
  }

  // --- Autres ressources ---
  autresList.innerHTML = "";
  if(llmData?.autresModules){
    llmData.autresModules.forEach(m=>{
      const li = document.createElement("li");
      li.innerHTML = `<strong>${m.titre}</strong>`;
      if(m.items?.length){
        const subUl = document.createElement("ul");
        m.items.forEach(it=>{
          const subLi = document.createElement("li");
          const a = document.createElement("a");
          a.href = it.lien;
          a.textContent = it.nom;
          a.target="_blank";
          subLi.appendChild(a);
          subUl.appendChild(subLi);
        });
        li.appendChild(subUl);
      }
      autresList.appendChild(li);
    });
  }
}

// --- Charger JSON ---
loadBtn.addEventListener("click", ()=>{
  const file = uploadJson.files[0];
  if(!file){ 
    alert("Choisis un fichier JSON LLM !"); 
    return; 
  }
  const reader = new FileReader();
  reader.onload = e=>{
    try{
      llmData = JSON.parse(e.target.result);
      renderModules();
      uploadStatus.textContent = `Fichier "${file.name}" chargé avec succès !`;
    }catch(err){ 
      console.error(err); 
      alert("Fichier JSON invalide !"); 
      uploadStatus.textContent = "";
    }
  };
  reader.readAsText(file);
});

// --- Générer Mail GPT ---
generateMailBtn.addEventListener("click", () => {
  if(!llmData?.messages) return;
  const selectedMessages = llmData.messages.filter(m => m.envoyé);
  if(selectedMessages.length === 0){
    alert("Coche au moins un message !");
    return;
  }

  const promptId = mailPromptSelect.value;
  const promptTexte = mailPrompts[promptId];

  let content = selectedMessages.map(m => `À: ${m.destinataire}\nSujet: ${m.sujet}\nMessage: ${m.texte}`).join("\n\n");
  const finalPrompt = `${promptTexte}\n\n${content}`;

  // Copier dans le presse-papiers
  navigator.clipboard.writeText(finalPrompt)
    .then(() => alert("Prompt + messages copiés dans le presse-papiers !"))
    .catch(err => console.error("Erreur copie: ", err));

  // Ouvrir ChatGPT
  window.open("https://chatgpt.com/", "_blank");
});
