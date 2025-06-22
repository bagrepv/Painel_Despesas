const mediaQuery = window.matchMedia("(max-width: 600px)");
const table = document.querySelector("table");
const th = document.querySelectorAll("th");
const td = document.querySelectorAll("td");

function toggleColumns() {
    if (mediaQuery.matches) {
        th.forEach((header, index) => {
            td[index].setAttribute("data-label", header.textContent);
        });
    } else {
        td.forEach((cell) => {
            cell.removeAttribute("data-label");
        });
    }
}

mediaQuery.addListener(toggleColumns);
toggleColumns();