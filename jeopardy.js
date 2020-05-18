const $jeopardyBoard = $("#jeopardy");
const $tableHead = $("thead");
const $tableBody = $("tbody");
const BASE_URL = "https://jservice.io/api/";
const NUM_CATEGORIES = 6;
const NUM_QUESTIONS_PER_CAT = 5;

let categories = [];
let gameData = [];

// let randNum = Math.floor(Math.random() * 5);
// let randomOffset = Math.floor(Math.random() * 100);

function randNum(num) {
  return Math.floor(Math.random() * num);
}

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
  const response = await axios.get(
    `${BASE_URL}/categories?count=18&offset=${randNum(50)}`
  );
  const categoryIds = [];
  for (let category of response.data) {
    categoryIds.push(category.id);
  }
  const categories = _.slice(categoryIds, 5, 11);
  return categories;
}

/** Return object with data about a category */

async function getCategory(catId) {
  const response = await axios.get(`${BASE_URL}category?id=${catId}`);
  const title = response.data.title;
  const clues = response.data.clues;
  return { catId, title, clues };
}

async function getClue(catId) {
  const response = await axios.get(`${BASE_URL}clues?category=${catId}}`);
  console.log(response.data);
}

async function getGameData() {
  const categoryIds = await getCategoryIds();
  for (let catId of categoryIds) {
    const response = await getCategory(catId);
    gameData.push(response);
  }
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
  const $topTr = $(`<tr class="category"></tr>`);
  for (let x = 0; x < NUM_CATEGORIES; x++) {
    const $td = $(`<td id="${gameData[x].catId}">${gameData[x].title}</td>`);
    $topTr.append($td);
  }

  $tableHead.append($topTr);

  // Create grid of cells
  for (let x = 0; x < NUM_QUESTIONS_PER_CAT; x++) {
    const $tr = $(`<tr></tr>`);
    for (let y = 0; y < NUM_CATEGORIES; y++) {
      const $td = $(`<td id="${y}-${x}" data-showing="">?</td>`);
      $tr.append($td);
    }
    $tableBody.append($tr);
  }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

async function handleClick(event) {
  const $target = $(event.target);
  const $showing = $target[0].dataset.showing;
  const x = Number($target.attr("id").split("-", 1));
  const y = Number($target.attr("id").split("-")[1]);
  const clue = gameData[x].clues[y];

  if ($showing === "") {
    $target.addClass("clicked");
    $target.text(clue.question);
    $target.attr("data-showing", "question");
  } else if ($showing === "question") {
    $target.removeClass("clicked");
    $target.text(clue.answer);
    $target.attr("data-showing", "answer");
  }
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
  $("thead").empty();
  $("tbody").empty();
  await getGameData();
  fillTable();
}

/** On click of restart button, restart game. */

$("#restart").on("click", function () {
  location.reload();
});

/** On page load, setup and start & add event handler for clicking clues */

setupAndStart();
$("tbody").on("click", "td", handleClick);
