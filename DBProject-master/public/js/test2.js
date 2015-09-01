
	$(document).ready(function() {
          $('#example').dataTable( {
              "pagingType": "full_numbers"
          } );
      } );
	
    function disableHandler (form, inputName) {
    var inputs = form.elements[inputName];
    for (var i = 0; i < inputs.length; i++) {
    var input = inputs[i];
    input.onclick = function (evt) {
    if (this.checked) {
    disableInputs(this, inputs);
    }
    else {
    enableInputs(this, inputs);
    }
    return true;
    };
    }
    }
    
    function showHide(shID) {
        if (document.getElementById(shID)) {
        if (document.getElementById(shID+'-show').style.display != 'none') {
        document.getElementById(shID+'-show').style.display = 'none';
        document.getElementById(shID).style.display = 'block';
        }
        else {
        document.getElementById(shID+'-show').style.display = 'inline';
        document.getElementById(shID).style.display = 'none';
        }
        }
        }

    function disableInputs (input, inputs) {
    for (var i = 0; i < inputs.length; i++) {
    var currentInput = inputs[i];
    if (currentInput != input) {
    currentInput.disabled = true;
    }
    }
    }

    function enableInputs (input, inputs) {
    for (var i = 0; i < inputs.length; i++) {
    var currentInput = inputs[i];
    if (currentInput != input) {
    currentInput.disabled = false;
    }
    }
    }
 