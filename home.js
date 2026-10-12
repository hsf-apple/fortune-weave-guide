const characterSearch = document.getElementById("character-search");
const characterCards = [...document.querySelectorAll(".character-card")];
const availableSection = document.getElementById("available");
const plannedSection = document.getElementById("planned");
const emptyMessage = document.getElementById("search-empty");

characterSearch.addEventListener("input", () => {
  const query = characterSearch.value.trim().toLocaleLowerCase();
  for (const card of characterCards) {
    card.hidden = !card.dataset.search.includes(query);
  }
  availableSection.hidden = !availableSection.querySelector(".character-card:not([hidden])");
  plannedSection.hidden = !plannedSection.querySelector(".character-card:not([hidden])");
  emptyMessage.hidden = !(availableSection.hidden && plannedSection.hidden);
});
