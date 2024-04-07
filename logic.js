const canvas = document.getElementById('confettiCanvas')
const jsConfetti = new JSConfetti({
  canvas
})

// Formatters
let SARand = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  minimumFractionDigits: 2
});

const pageIDS = ["#P_SETUP", "#P_INFO", "#P_MONTHLY", "#P_ADDBENE", "#P_ONCEOFF", "#P_EDITBENE"]

// Flow inputs
let monthlyPocketCover = 350;
let onceOffPocketCover = 400;
let educationPocketCover = 0;
let totalCover = 0;

// Page calculations
let calcMonthlyAvailable = 0;
let calcMonthlyRemaining = 0;
let calcOnceOffAvailable = 0;
let calcOnceOffRemaining = 0;
let calcEducationAvailable = 0;
let calcEducationRemaining = 0;

// Caller Pages
let beneficiaryCallerPage = "";

// Beneficiary Lists
let beneficiaryListAll = [];
let beneficiaryListMonthly = [];
let beneficiaryListOnceOff = [];
let beneficiaryListEducation = [];

let currentEditBeneRowId = "";

// Init
$(document).ready(function() {
  $("#flowInput-monthly").val(monthlyPocketCover);
  $("#flowInput-onceOff").val(onceOffPocketCover);
  $("#flowInput-education").val(educationPocketCover);

  validateFlowData();
});

/**
 * Flow data checks
 */
function validateFlowData() {
  let monthlyPocketCover = $("#flowInput-monthly").val();
  let onceOffPocketCover = $("#flowInput-onceOff").val();
  let educationPocketCover = $("#flowInput-education").val();

  totalCover = _calculateFlowTotalCover($.isNumeric(monthlyPocketCover) ? monthlyPocketCover : 0, $.isNumeric(onceOffPocketCover) ? onceOffPocketCover : 0, $.isNumeric(educationPocketCover) ? educationPocketCover : 0);
  $("#flowTotalCoverMsg").html(SARand.format(totalCover));
  if ($.isNumeric(monthlyPocketCover) && $.isNumeric(onceOffPocketCover) && $.isNumeric(educationPocketCover)) {
    $("#startFlowButton").attr("disabled", false);

    calcMonthlyAvailable = monthlyPocketCover * 24;
    $("#calcMonthlyAvailable").html(SARand.format(calcMonthlyAvailable));
    $("#calcMonthlyRemaining").html(SARand.format(calcMonthlyRemaining));
  } else {
    $("#startFlowButton").attr("disabled", true);
  }

}

/**
 * Calculate total for flow
 */
function _calculateFlowTotalCover(monthlyVal, onceOffVal, educationVal) {
  return (parseFloat(monthlyVal) * 24) + parseFloat(onceOffVal) + parseFloat(educationVal);
}

/**
 * Change event for cover amounts on beneficiary cards
 * @param {*} beneRowId 
 * @param {*} selectedInput 
 */
function validateBeneficiaryCover(beneRowId, selectedInput, callerPage) {
  var coverValue = selectedInput.value;

  if (callerPage === "MONTHLY") {
    let curBene = beneficiaryListMonthly.find(bene => bene.rowId === beneRowId);
    curBene.coverAmount = (coverValue * 24);

    const totalCoverUsed = beneficiaryListMonthly.reduce((accumulator, object) => {
      return accumulator + object.coverAmount;
    }, 0);

    calcMonthlyRemaining = parseInt(calcMonthlyAvailable) - parseInt((totalCoverUsed));
    $("#calcMonthlyRemaining").html(SARand.format(calcMonthlyRemaining));
  };
}

/**
 * CRUD Functions
 */

function submitAddBeneficiaryForm() {
  let beneficiary = {
    relationship: $("#newBeneRelationship").val() ? $("#newBeneRelationship").val() : "",
    firstName: $("#newBeneFirstname").val() ? $("#newBeneFirstname").val() : "",
    lastName: $("#newBeneLastname").val() ? $("#newBeneLastname").val() : "",
    idNumber: $("#newBeneIDNumber").val() ? $("#newBeneIDNumber").val() : "",
    dateOfBirth: $("#newBeneDateOfBirth").val() ? $("#newBeneDateOfBirth").val() : "",
    cellphone: $("#newBeneCelphoneNumber").val() ? $("#newBeneCelphoneNumber").val() : "",
    emailAddress: $("#newBeneEmailAddress").val() ? $("#newBeneEmailAddress").val() : "",
    coverAmount: 0,
    rowId: new Date().getTime()
  }

  addBeneficiary(beneficiary);
}

/**
 * Validate & Add Beneficiary to lists
 * @returns void
 */
function addBeneficiary(beneficiary) {

  // Validate Here
  let isValid = true;
  beneficiaryListAll.forEach(bene => {
    if (bene.idNumber === beneficiary.idNumber) {
      alert("Beneficiary with ID Number already exists")
      isValid = false;
      return;
    }
  });
  if (!isValid) return;

  // Add to lists
  beneficiaryListAll.push(beneficiary);
  console.log(beneficiaryCallerPage)

  if (beneficiaryCallerPage === "#P_MONTHLY") {
    beneficiaryListMonthly.push(beneficiary);
    console.log(beneficiaryCallerPage)
    let htmlString = ``;
    beneficiaryListMonthly.forEach(bene => {
      htmlString = htmlString + `
            <div class="beneficiaryCard" id="${bene.rowId}">
                <div class="beneficiaryCard-info">
                    <div class="beneficiaryCard-info-avatar-row">
                        <div class="beneficiaryCard-info-avatar">
                            ${bene.firstName.charAt(0).toUpperCase() + bene.lastName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div>${bene.relationship}</div>
                            <div><b>${bene.firstName} ${bene.lastName}</b></div>
                        </div>
                    </div>
                    <div class="beneficiaryCard-info-details-row" onclick="removeBeneficiary('MONTHLY', ${bene.rowId})">
                        &#62;
                    </div>
                </div>
                <div class="beneficiaryCard-values">
                    <input class="field beneficiaryCard-values-input" onkeyup="validateBeneficiaryCover(${bene.rowId}, this, 'MONTHLY')" value="${bene.coverAmount}" />
                    <input type="hidden" id="${bene.rowId}" />
                    <div class="beneficiaryCard-values-hint">Monthly amount for 24 months</div>
                </div>
            </div>`
    });

    $("#beneficiaryListContainer-monthly").html(htmlString);
    console.log(beneficiaryCallerPage)
    // Clear form
    $("#newBeneRelationship").val("Spouse");
    $("#newBeneFirstname").val("")
    $("#newBeneLastname").val("")
    $("#newBeneIDNumber").val("")
    $("#newBeneDateOfBirth").val("")
    $("#newBeneCelphoneNumber").val("")
    $("#newBeneEmailAddress").val("")
    console.log(beneficiaryCallerPage)
    if (beneficiaryListMonthly.length >= 2) {
      $("#monthlyAddBeneButton").hide();
    }
    $("#monthlyNextButton").show();
    console.log(beneficiaryCallerPage)
    _rebuildQuickSelect("MONTHLY");
    console.log(beneficiaryCallerPage)
    beneficiariesGoBack();

  } else if (beneficiaryCallerPage === "#P_ONCEOFF") {
    beneficiaryListOnceOff.push(beneficiary);

    let htmlString = ``;
    beneficiaryListOnceOff.forEach(bene => {
      htmlString = htmlString + `
            <div class="beneficiaryCard" id="${bene.rowId}">
                <div class="beneficiaryCard-info">
                    <div class="beneficiaryCard-info-avatar-row">
                        <div class="beneficiaryCard-info-avatar">
                            ${bene.firstName.charAt(0).toUpperCase() + bene.lastName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div>${bene.relationship}</div>
                            <div><b>${bene.firstName} ${bene.lastName}</b></div>
                        </div>
                    </div>
                    <div class="beneficiaryCard-info-details-row" onclick="removeBeneficiary('ONCEOFF', ${bene.rowId})">
                        &#62;
                    </div>
                </div>
                <div class="beneficiaryCard-values">
                    <input class="field beneficiaryCard-values-input" onkeyup="validateBeneficiaryCover(${bene.rowId}, this, 'ONCEOFF')" value="${bene.coverAmount}" />
                    <input type="hidden" id="${bene.rowId}" />
                </div>
            </div>`
    });

    $("#beneficiaryListContainer-onceoff").html(htmlString);

    // Clear form
    $("#newBeneRelationship").val("Spouse");
    $("#newBeneFirstname").val("")
    $("#newBeneLastname").val("")
    $("#newBeneIDNumber").val("")
    $("#newBeneDateOfBirth").val("")
    $("#newBeneCelphoneNumber").val("")
    $("#newBeneEmailAddress").val("")

    if (beneficiaryListOnceOff.length >= 2) {
      $("#onceoffAddBeneButton").hide();
    }
    $("#onceoffNextButton").show();

    _rebuildQuickSelect("ONCEOFF");
    beneficiariesGoBack();
  } else {
    alert("Caller Page NOT set")
  }
}

/**
 * Remove beneficiary
 * @param {*} callerPage 
 * @param {*} beneRowId 
 */
function removeBeneficiary(callerPage, beneRowId) {
  // beneficiaryListAll.splice(beneficiaryListAll.findIndex(bene => bene.rowId === beneRowId), 1)
  if (callerPage === "MONTHLY") {
    console.log('in monthly remove');
    console.log('beneficiaryListMonthly before :>> ', beneficiaryListMonthly);

    beneficiaryListMonthly.splice(beneficiaryListMonthly.findIndex(bene => bene.rowId === beneRowId), 1);
    $(`#${beneRowId}`).remove();

    console.log('beneficiaryListMonthly after :>> ', beneficiaryListMonthly);

    if (beneficiaryListMonthly.length == 0) {
      $("#monthlyAddBeneButton").show();
      $("#monthlyNextButton").hide();
    } else if (beneficiaryListMonthly.length == 1) {
      $("#monthlyAddBeneButton").show();
      $("#monthlyNextButton").show();
    } else if (beneficiaryListMonthly.length >= 2) {
      $("#monthlyAddBeneButton").hide();
      $("#monthlyNextButton").show();
    }

    _rebuildQuickSelect("MONTHLY");
  }
  if (callerPage === "ONCEOFF") {
    console.log('in onceoff remove');
    console.log('beneficiaryListOnceOff before :>> ', beneficiaryListOnceOff);

    beneficiaryListOnceOff.splice(beneficiaryListOnceOff.findIndex(bene => bene.rowId === beneRowId), 1);
    $(`#${beneRowId}`).remove();

    console.log('beneficiaryListOnceOff after :>> ', beneficiaryListOnceOff);

    if (beneficiaryListOnceOff.length == 0) {
      $("#onceoffAddBeneButton").show();
      $("#onceoffNextButton").hide();
    } else if (beneficiaryListOnceOff.length == 1) {
      $("#onceoffAddBeneButton").show();
      $("#onceoffNextButton").show();
    } else if (beneficiaryListOnceOff.length >= 2) {
      $("#onceoffAddBeneButton").hide();
      $("#onceoffNextButton").show();
    }

    _rebuildQuickSelect("ONCEOFF");
  }
}

/**
 * Remove from all lists - from edit bene page
 */
function removeBeneficiaryPermanent() {
  console.log('PERMANENT REMOVE');
  console.log('beneRowId: ', currentEditBeneRowId);

  // TODO: Are you sure dialog, if user already exists

  // check all lists
  beneficiaryListMonthly.splice(beneficiaryListMonthly.findIndex(bene => bene.rowId === currentEditBeneRowId), 1);
  beneficiaryListOnceOff.splice(beneficiaryListOnceOff.findIndex(bene => bene.rowId === currentEditBeneRowId), 1);
  beneficiaryListAll.splice(beneficiaryListAll.findIndex(bene => bene.rowId === currentEditBeneRowId), 1);

  _rebuildQuickSelect();

  goToPage(beneficiaryCallerPage)


}

/**
 * Move item from quick list to correct pocket
 * @param {*} callerPage 
 * @param {*} beneRowId 
 */
function quickAddToList(callerPage, beneRowId) {

  let beneToAdd = beneficiaryListAll.find(x => x.rowId == beneRowId);
  console.log('beneToAdd :>> ', beneToAdd);
  if (callerPage === "MONTHLY") {
    beneficiaryListMonthly.push(beneToAdd);

    let htmlString = ``;
    beneficiaryListMonthly.forEach(bene => {
      htmlString = htmlString + `
            <div class="beneficiaryCard" id="${bene.rowId}">
                <div class="beneficiaryCard-info">
                    <div class="beneficiaryCard-info-avatar-row">
                        <div class="beneficiaryCard-info-avatar">
                            ${bene.firstName.charAt(0).toUpperCase() + bene.lastName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div>${bene.relationship}</div>
                            <div><b>${bene.firstName} ${bene.lastName}</b></div>
                        </div>
                    </div>
                    <div class="beneficiaryCard-info-details-row" onclick="removeBeneficiary('MONTHLY', ${bene.rowId})">
                        &#62;
                    </div>
                </div>
                <div class="beneficiaryCard-values">
                    <input class="field beneficiaryCard-values-input" onkeyup="validateBeneficiaryCover(${bene.rowId}, this, 'MONTHLY')" value="${bene.coverAmount}" />
                    <input type="hidden" id="${bene.rowId}" />
                    <div class="beneficiaryCard-values-hint">Monthly amount for 24 months</div>
                </div>
            </div>`
    });

    $("#beneficiaryListContainer-monthly").html(htmlString);

    // Clear form
    $("#newBeneRelationship").val("Spouse");
    $("#newBeneFirstname").val("")
    $("#newBeneLastname").val("")
    $("#newBeneIDNumber").val("")
    $("#newBeneDateOfBirth").val("")
    $("#newBeneCelphoneNumber").val("")
    $("#newBeneEmailAddress").val("")

    if (beneficiaryListMonthly.length >= 2) {
      $("#monthlyAddBeneButton").hide();
    }
    $("#monthlyNextButton").show();
    _rebuildQuickSelect("MONTHLY");
  } else if (callerPage == "ONCEOFF") {
    beneficiaryListOnceOff.push(beneToAdd);
    console.log('beneficiaryListOnceOff after quickAddToList:>> ', beneficiaryListOnceOff);
    let htmlString = ``;
    beneficiaryListOnceOff.forEach(bene => {
      htmlString = htmlString + `
            <div class="beneficiaryCard" id="${bene.rowId}">
                <div class="beneficiaryCard-info">
                    <div class="beneficiaryCard-info-avatar-row">
                        <div class="beneficiaryCard-info-avatar">
                            ${bene.firstName.charAt(0).toUpperCase() + bene.lastName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div>${bene.relationship}</div>
                            <div><b>${bene.firstName} ${bene.lastName}</b></div>
                        </div>
                    </div>
                    <div class="beneficiaryCard-info-details-row" onclick="removeBeneficiary('ONCEOFF', ${bene.rowId})">
                        &#62;
                    </div>
                </div>
                <div class="beneficiaryCard-values">
                    <input class="field beneficiaryCard-values-input" onkeyup="validateBeneficiaryCover(${bene.rowId}, this, 'ONCEOFF')" value="${bene.coverAmount}" />
                    <input type="hidden" id="${bene.rowId}" />
                </div>
            </div>`
    });

    $("#beneficiaryListContainer-onceoff").html(htmlString);

    if (beneficiaryListOnceOff.length >= 2) {
      $("#onceoffAddBeneButton").hide();
    }
    $("#onceoffNextButton").show();
    _rebuildQuickSelect("ONCEOFF");
  }
}

/**
 * Rebuild quick select on all pages
 */
function _rebuildQuickSelect(callerPage) {

  console.log('beneficiaryListAll :>> ', beneficiaryListAll);
  console.log('beneficiaryListMonthly :>> ', beneficiaryListMonthly);
  console.log('beneficiaryListOnceOff :>> ', beneficiaryListOnceOff);
  // let difference = beneficiaryListAll.filter(x => !beneficiaryListMonthly.includes(x.rowId));
  let difference = _getArrayDifference(beneficiaryListAll, beneficiaryListMonthly)
  console.log('difference :>> ', difference);
  if (difference.length != 0) {
    let htmlString = ``;
    difference.forEach(bene => {
      htmlString = htmlString + `
                <div class="beneficiaryCard" id="${bene.rowId}">
                    <div class="beneficiaryCard-info">
                        <div class="beneficiaryCard-info-avatar-row">
                            <div class="beneficiaryCard-info-avatar">
                                ${bene.firstName.charAt(0).toUpperCase() + bene.lastName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div>${bene.relationship}</div>
                                <div><b>${bene.firstName} ${bene.lastName}</b></div>
                            </div>
                        </div>
                        <div class="beneficiaryCard-info-details-row" onclick="goToEditBenePage('#P_MONTHLY', ${bene.rowId})">
                            &#62;
                        </div>
                    </div>
                </div>`
    });

    $("#beneficiaryQuickListContainer-monthly").show();
    $("#beneficiaryListContainer-monthly-quick-select").html(htmlString);
    _reloadMonthly()
  } else {
    if (beneficiaryListMonthly.length === 0) {
      $("#beneficiaryListContainer-monthly").html("");
    } else {
      _reloadMonthly()
    }

    $("#beneficiaryQuickListContainer-monthly").hide();
  }

  let difference2 = _getArrayDifference(beneficiaryListAll, beneficiaryListOnceOff)
  console.log('difference2 :>> ', difference2);
  // beneficiaryCallerPage =  "#P_ONCEOFF"
  if (difference2.length != 0) {
    let htmlString = ``;
    difference2.forEach(bene => {
      htmlString = htmlString + `
            <div class="beneficiaryCard" id="${bene.rowId}">
                <div class="beneficiaryCard-info">
                    <div class="beneficiaryCard-info-avatar-row">
                        <div class="beneficiaryCard-info-avatar">
                            ${bene.firstName.charAt(0).toUpperCase() + bene.lastName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div>${bene.relationship}</div>
                            <div><b>${bene.firstName} ${bene.lastName}</b></div>
                        </div>
                    </div>
                    <div class="beneficiaryCard-info-details-row" onclick="goToEditBenePage('#P_ONCEOFF', ${bene.rowId})">
                        &#62;
                    </div>
                </div>
            </div>`
    });

    console.log("in (difference2.length != 0)");
    $("#beneficiaryQuickListContainer-onceoff").show();
    $("#beneficiaryListContainer-onceoff-quick-select").html(htmlString);
    _reloadOnceOff()
  } else {
    if (beneficiaryListOnceOff.length === 0) {
      console.log("in (beneficiaryListOnceOff.length === 0)");
      $("#beneficiaryListContainer-onceoff").html("");
    } else {
      console.log("before reload");
      _reloadOnceOff()
    }

    $("#beneficiaryQuickListContainer-onceoff").hide();
  }


  // Build Quick Select
  // Rebuild Quick Select

  // find any that are not currently in MOnthly
  // build list if there is
}



/** 
 * Navigation 
 */

/**
 * Navigate via pageID
 * @param {*} nextPageID 
 */
function goToPage(nextPageID) {

  if (nextPageID === "DONE") {
    jsConfetti.addConfetti({
      confettiColors: [
        '#ff0a54', '#ff477e', '#ff7096', '#ff85a1', '#fbb1bd', '#f9bec7',
      ],
    })
  } else {
    _hideAllPages();
    $(nextPageID).show();
  }

}

function _reloadMonthly() {
  let htmlString = ``;
  beneficiaryListMonthly.forEach(bene => {
    htmlString = htmlString + `
            <div class="beneficiaryCard" id="${bene.rowId}">
                <div class="beneficiaryCard-info">
                    <div class="beneficiaryCard-info-avatar-row">
                        <div class="beneficiaryCard-info-avatar">
                            ${bene.firstName.charAt(0).toUpperCase() + bene.lastName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div>${bene.relationship}</div>
                            <div><b>${bene.firstName} ${bene.lastName}</b></div>
                        </div>
                    </div>
                    <div class="beneficiaryCard-info-details-row" onclick="removeBeneficiary('MONTHLY', ${bene.rowId})">
                        &#62;
                    </div>
                </div>
                <div class="beneficiaryCard-values">
                    <input class="field beneficiaryCard-values-input" onkeyup="validateBeneficiaryCover(${bene.rowId}, this, 'MONTHLY')" value="${bene.coverAmount}" />
                    <input type="hidden" id="${bene.rowId}" />
                    <div class="beneficiaryCard-values-hint">Monthly amount for 24 months</div>
                </div>
            </div>`
  });

  $("#beneficiaryListContainer-monthly").html(htmlString);
}

function _reloadOnceOff() {
  let htmlString = ``;
  beneficiaryListOnceOff.forEach(bene => {
    htmlString = htmlString + `
            <div class="beneficiaryCard" id="${bene.rowId}">
                <div class="beneficiaryCard-info">
                    <div class="beneficiaryCard-info-avatar-row">
                        <div class="beneficiaryCard-info-avatar">
                            ${bene.firstName.charAt(0).toUpperCase() + bene.lastName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div>${bene.relationship}</div>
                            <div><b>${bene.firstName} ${bene.lastName}</b></div>
                        </div>
                    </div>
                    <div class="beneficiaryCard-info-details-row" onclick="removeBeneficiary('ONCEOFF', ${bene.rowId})">
                        &#62;
                    </div>
                </div>
                <div class="beneficiaryCard-values">
                    <input class="field beneficiaryCard-values-input" onkeyup="validateBeneficiaryCover(${bene.rowId}, this, 'ONCEOFF')" value="${bene.coverAmount}" />
                    <input type="hidden" id="${bene.rowId}" />
                </div>
            </div>`
  });

  $("#beneficiaryListContainer-onceoff").html(htmlString);
}

/**
 * Hide all pages regardless of visibility
 */
function _hideAllPages() {
  pageIDS.forEach(element => {
    $(element).hide();
  });
}

/**
 * Open Add Beneficiary Page
 */
function goToAddBeneficiary(callerPage) {
  goToPage("#P_ADDBENE");
  beneficiaryCallerPage = callerPage;
}

/**
 * Edit Beneficiaries back button
 */
function editBeneBackClick() {
  goToPage(beneficiaryCallerPage);
}

/**
 * 
 * @param {String} page 
 * @param {*} beneRowId 
 */
function goToEditBenePage(page, beneRowId) {

  let selectedBene = beneficiaryListAll.find(x => x.rowId == beneRowId);

  $("#editBeneRelationship").val(selectedBene.relationship);
  $("#editBeneFirstname").val(selectedBene.firstName);
  $("#editBeneLastname").val(selectedBene.lastName);
  $("#editBeneIDNumber").val(selectedBene.idNumber);
  $("#editBeneDateOfBirth").val(selectedBene.dateOfBirth);
  $("#editBeneCelphoneNumber").val(selectedBene.cellphone);
  $("#editBeneEmailAddress").val(selectedBene.emailAddress);

  currentEditBeneRowId = beneRowId;
  console.log('selectedBene :>> ', selectedBene);

  beneficiaryCallerPage = page

  goToPage("#P_EDITBENE");
}

function submitEditBeneficiaryForm() {

  beneficiaryListAll.forEach((bene, index) => {
    if (bene.rowId === currentEditBeneRowId) {
      beneficiaryListAll[index].relationship = $("#editBeneRelationship").val();
      beneficiaryListAll[index].firstName = $("#editBeneFirstname").val();
      beneficiaryListAll[index].lastName = $("#editBeneLastname").val();
      beneficiaryListAll[index].idNumber = $("#editBeneIDNumber").val();
      beneficiaryListAll[index].dateOfBirth = $("#editBeneDateOfBirth").val();
      beneficiaryListAll[index].cellphone = $("#editBeneCelphoneNumber").val();
      beneficiaryListAll[index].emailAddress = $("#editBeneEmailAddress").val();
    }
  })

  beneficiaryListMonthly.forEach((bene, index) => {
    if (bene.rowId === currentEditBeneRowId) {
      beneficiaryListMonthly[index].relationship = $("#editBeneRelationship").val();
      beneficiaryListMonthly[index].firstName = $("#editBeneFirstname").val();
      beneficiaryListMonthly[index].lastName = $("#editBeneLastname").val();
      beneficiaryListMonthly[index].idNumber = $("#editBeneIDNumber").val();
      beneficiaryListMonthly[index].dateOfBirth = $("#editBeneDateOfBirth").val();
      beneficiaryListMonthly[index].cellphone = $("#editBeneCelphoneNumber").val();
      beneficiaryListMonthly[index].emailAddress = $("#editBeneEmailAddress").val();
    }
  })

  beneficiaryListOnceOff.forEach((bene, index) => {
    if (bene.rowId === currentEditBeneRowId) {
      beneficiaryListOnceOff[index].relationship = $("#editBeneRelationship").val();
      beneficiaryListOnceOff[index].firstName = $("#editBeneFirstname").val();
      beneficiaryListOnceOff[index].lastName = $("#editBeneLastname").val();
      beneficiaryListOnceOff[index].idNumber = $("#editBeneIDNumber").val();
      beneficiaryListOnceOff[index].dateOfBirth = $("#editBeneDateOfBirth").val();
      beneficiaryListOnceOff[index].cellphone = $("#editBeneCelphoneNumber").val();
      beneficiaryListOnceOff[index].emailAddress = $("#editBeneEmailAddress").val();
    }
  })

  if (beneficiaryCallerPage === "#P_MONTHLY") {
    quickAddToList('MONTHLY', currentEditBeneRowId);
  }

  if (beneficiaryCallerPage === "#P_ONCEOFF") {
    quickAddToList('ONCEOFF', currentEditBeneRowId);
  }


  _rebuildQuickSelect();

  goToPage(beneficiaryCallerPage)
}

/**
 * Add Beneficiaries back button
 */
function beneficiariesGoBack() {
  goToPage(beneficiaryCallerPage);
}

function _getArrayDifference(array1, array2) {
  return array1.filter(object1 => {
    return !array2.some(object2 => {
      return object1.rowId === object2.rowId;
    });
  });
}
