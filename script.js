let addBtn = document.querySelector(".add-btn");
let removeBtn = document.querySelector(".remove-btn");
let modalCont = document.querySelector(".modal-cont");
let mainCont = document.querySelector(".main-cont");
let textArea = document.querySelector(".textarea-cont");
let allPriorityColors = document.querySelectorAll(".priority-color");
let toolBoxColors = document.querySelectorAll(".color");

let colors = [ "lightpink", "lightblue", "lightgreen", "black" ];
let modalPriorityColor = colors[colors.length-1];

let addFlag = false;
let removeFlag = false;

let lockClass = "fa-lock";
let unlockClass = "fa-lock-open";

let ticketsArr = [];

if (localStorage.getItem("Tickets")) {
    // get tickets from local storage and display them
    ticketsArr = JSON.parse(localStorage.getItem("Tickets"));
    ticketsArr.forEach((ticketObj) => {
        createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketID);
    })
}

for (let i=0; i < toolBoxColors.length; i++) {
    toolBoxColors[i].addEventListener("click", (e) => {
        let currentToolBoxColor = toolBoxColors[i].classList[0];

        let filteredTickets = ticketsArr.filter((ticketObj,idx) => {
            return currentToolBoxColor === ticketObj.ticketColor;
        })

        // removing all the tickets that are present
        let allTicketsCont = document.querySelectorAll(".ticket-cont");
        for (let i=0; i< allTicketsCont.length; i++) {
            allTicketsCont[i].remove();
        }

        // displaying the filtered tickets
        filteredTickets.forEach((ticketObj, idx) => {
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketID);
        })
    })

    // on double clicking the toolbox colors we will get all the tickets that were present before filtering out
    toolBoxColors[i].addEventListener("dblclick", (e) => {
        // remove previous tickets
        let allTicketsCont = document.querySelectorAll(".ticket-cont");
        for (let i=0; i < allTicketsCont.length; i++) {
            allTicketsCont[i].remove();
        }

        ticketsArr.forEach((ticketObj,idx) => {
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketID);
        })
    })

}

//listener for modal priority coloring
allPriorityColors.forEach((colorElem, idx) => {
    colorElem.addEventListener("click", (e) => {
        allPriorityColors.forEach((priorityColorElem, idx) => {
            priorityColorElem.classList.remove("border");
        })
        colorElem.classList.add("border");

        modalPriorityColor = colorElem.classList[0];
    })
})

addBtn.addEventListener("click", (e) => {
    // Display Modal
    // Generate ticket

    // addFlag = true -> display the modal
    // addFlag = false -> hide the modal

    addFlag = !addFlag;
    if (addFlag)
    {
        modalCont.style.display = "flex";
    }
    else
    {
        modalCont.style.display = "none" 
    }
})

removeBtn.addEventListener("click", (e) => {
    removeFlag = !removeFlag;
})

modalCont.addEventListener("keydown", (e)=>{
    let key = e.key;
    if (key === "Shift"){
        createTicket(modalPriorityColor, textArea.value);
        setModalToDefault();
        addFlag = false;
    }
})

function createTicket(ticketColor, ticketTask, ticketID) {
    let id = ticketID || shortid();
    let ticketCont = document.createElement("div");
    ticketCont.setAttribute("class", "ticket-cont");
    ticketCont.innerHTML = `<div class="ticket-color ${ticketColor}"></div><div class="ticket-id">#${id}</div><div class="task-area">${ticketTask}</div><div class="ticket-lock">
    <i class="fa-solid fa-lock"></i>
</div>`;
    mainCont.appendChild(ticketCont);

    // adding tickets to ticketArr
    if (!ticketID) {
        ticketsArr.push({ ticketColor, ticketTask, ticketID:id });
        localStorage.setItem("Tickets", JSON.stringify(ticketsArr));
    }

    handleRemoval(ticketCont, id);
    handleLock(ticketCont, id);
    handlePriorityColor(ticketCont, id);
}

function handleRemoval(ticket, id) {
    //if removeflag-> true then -> remove the ticket
    ticket.addEventListener("click", (e) => {
        if(!removeFlag) return;

        let idx = getTicketIdx(id);

        // db removal
        ticketsArr.splice(idx, 1);
        let stringTicketsArr = JSON.stringify(ticketsArr);
        localStorage.setItem("Tickets", stringTicketsArr);

        ticket.remove(); // ui removal;
    })
}

function handleLock(ticket, id) {
    let ticketLockElem = ticket.querySelector(".ticket-lock");
    let ticketLock = ticketLockElem.children[0];
    let ticketTaskArea = ticket.querySelector(".task-area");
    ticketLock.addEventListener("click", (e) => {
        let ticketIdx = getTicketIdx(id);
        if (ticketLock.classList.contains(lockClass)) {
            ticketLock.classList.remove(lockClass);
            ticketLock.classList.add(unlockClass); 
            ticketTaskArea.setAttribute("contenteditable", "true");
        }
        else{
            ticketLock.classList.remove(unlockClass);
            ticketLock.classList.add(lockClass);
            ticketTaskArea.setAttribute("contenteditable", "false");
        }

        // modifying data in local storage (ticket task)
        ticketsArr[ticketIdx].ticketTask = ticketTaskArea.innerText;
        localStorage.setItem("Tickets", JSON.stringify(ticketsArr));
    })
}

function handlePriorityColor(ticket, id) {
    let ticketColor = ticket.querySelector(".ticket-color");
    ticketColor.addEventListener("click", (e) => {
        // get ticket index from ticket array
        let ticketIdx = getTicketIdx(id);

        let currentTicketColor = ticketColor.classList[1];
        // finding the current color index
        let currentTicketColorIdx = colors.findIndex((color) => {
            return currentTicketColor === color;
        })
        currentTicketColorIdx++;
        let newTicketColorIdx = currentTicketColorIdx % colors.length;
        let newTicketColor = colors[newTicketColorIdx];
        ticketColor.classList.remove(currentTicketColor);
        ticketColor.classList.add(newTicketColor);

        // Modify data in our local storage (priority color change)
        ticketsArr[ticketIdx].ticketColor = newTicketColor;
        localStorage.setItem("Tickets", JSON.stringify(ticketsArr));
    })
}

function getTicketIdx(id) {
    let ticketIdx = ticketsArr.findIndex((ticketObj) => {
        return ticketObj.ticketID === id;
    })
    return ticketIdx;
}

function setModalToDefault() {
    modalCont.style.display = "none";
    textArea.value = "";
    modalPriorityColor = colors[colors.length-1];
    allPriorityColors.forEach((priorityColorElem, idx) => {
        priorityColorElem.classList.remove("border");
    })
    allPriorityColors[allPriorityColors.length-1].classList.add("border");
}