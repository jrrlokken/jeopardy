const $jeopardyBoard = $("#jeopardy");
const $tableHead = $("thead");
const $tableBody = $("tbody");
const BASE_URL = "https://jservice.io/api/";
const NUM_CATEGORIES = 6;
const NUM_QUESTIONS_PER_CAT = 5;

let categories = [];

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
  const response = await axios.get(
    `${BASE_URL}/categories?count=${NUM_CATEGORIES}&offset=15`
  );
  const categoryIds = [];
  for (let category of response.data) {
    categoryIds.push(category.id);
  }
  return categoryIds;
}

/** Return object with data about a category */

async function getCategory(catId) {
  const response = await axios.get(`${BASE_URL}/category?id=${catId}`);
  const title = response.data.title;
  const clues = response.data.clues;
  return { title, clues };
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
  const getIds = await getCategoryIds();
  const columnData = [];
  for (let id of getIds) {
    const response = await getCategory(id);
    columnData.push(response);
  }

  // Create the top table row, set its ID and add an event listener
  const $topTr = $(`<tr class="category"></tr>`);
  for (let x = 0; x < NUM_CATEGORIES; x++) {
    const $td = $(`<td>${columnData[x].title}</td>`);
    $topTr.append($td);
  }

  $tableHead.append($topTr);

  // Create grid of cells
  for (let y = 0; y < NUM_QUESTIONS_PER_CAT; y++) {
    const $tr = $(`<tr></tr>`);
    const clues = columnData[y].clues;
    console.log(clues);
    for (let x = 0; x < NUM_CATEGORIES; x++) {
      const $td = $(`<td data-showing="">${clues[x]}</td>`);
      // console.log(clues[x]);
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

function handleClick(event) {
  const $target = $(event.target);
  const showing = event.target.dataset.showing;

  if (showing === "") {
    $target.attr("data-showing", "question");
  } else if (showing === "question") {
    // display the answer in the td
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
  fillTable();
}

/** On click of restart button, restart game. */

$("#restart").on("click", setupAndStart);

/** On page load, setup and start & add event handler for clicking clues */

setupAndStart();
$("tbody").on("click", "td", handleClick);
