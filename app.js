// 1. Budget Controller
var budgetController = (function(){
    var Expense = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) *100 );
        }
        else{
            this.percentage = -1;
        }
    }
    
    Expense.prototype.getPercentage = function(){
        return this.percentage; 
    }

    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(current){
            sum += current.value;
        });
        data.totals[type] = sum;
    }
    return {
        addItem : function(type,desc,value){

            var newItem,ID;

            // Creating ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length-1].id + 1; //data.allItems.exp[data.allItems.exp.length - 1].id + 1
            }
            else{
                ID = 0;
            }
            
            // Creating an item
            if(type === "inc"){
                newItem = new Income(ID,desc,value);
            }
            else if(type === "exp"){
                newItem = new Expense(ID,desc,value);
            }

            // Pushing an item to the data structure bases on the "inc" or "exp type"
            data.allItems[type].push(newItem); // as we have used same name in the "data" datstructure we can go by this way
            
            // returning the item
            return newItem;
        },
        testing: function(){
            console.log(data);
        },
        calculateBudget : function(){
            
            // calculate total income and expenses
            calculateTotal("inc");
            calculateTotal("exp");

            // budget = total income - total expenses
            data.budget = data.totals["inc"] - data.totals["exp"];

            // percentage of the income spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals["exp"] / data.totals["inc"]) * 100);
            }
            else{
                data.percentage = -1;
            }
        },

        calculatePercentages : function(){
            data.allItems.exp.forEach(function(current){
                current.calcPercentage(data.totals.inc);
            });
        },

        getPercentages : function(){
            var allPercentages = data.allItems.exp.map(function(current){
                return current.getPercentage();
            });
            return allPercentages;
        },

        getBudget: function(){
            return{
                budget : data.budget,
                totalInc : data.totals.inc,
                totalExp : data.totals.exp,
                percentage : data.percentage
            }
        },
        deleteItem : function(type,id){
            var ids, index;

            ids = data.allItems[type].map(function(current){
                return current.id; // this will return an array of all the ids currently in the global data structure
            });

            index = ids.indexOf(id); // array.indexOf(givenElement)

            if(index !== -1){
                data.allItems[type].splice(index, 1) // splice(startting index, no of elements) no of elements include starting index
            }
        }
    }
})();

// 2. UI Controller
var UIController = (function(){ // Function -> Object -> Function -> Object -> 3 variables

    var DOMStrings = {
        inputType : ".add__type",
        inputDescription : ".add__description" ,
        inputValue : ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expensesLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expensesPercentagesLabel: ".item__percentage",
        dateLabel: ".budget__title--month"
    }
    var formatNumber = function(num, type){
        var num, sign, numSplit, int, dec;
            // exactly two decimals points
            num = Math.abs(num);
            num = num.toFixed(2);  // returns a string Ex  : 200.2345 -> 200.23 
            
            // comma after thousands 
                    //numSplit  = num.split(".");

            num = parseFloat(num);  
            num = num.toLocaleString("en-IN",{style : "currency", currency :"INR"}); // converts it into local string according to the number system in the specified region, default is "en-US"

            // + or - 
                    //dec = numSplit[1];
            type === "exp" ? sign = "-":sign = "+";

        return sign + " " + num;
    }

    var nodeListForEach = function(list,callback){
        for(var i = 0 ; i<list.length ;i++ ){
            callback(list[i],i);
        }
    }

    return{
        getInput: function(){
            return{
                type: document.querySelector(DOMStrings.inputType).value, // will be either "inc" or "exp"
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },
        getDOMStrings: function(){
            return DOMStrings;
        },

        addListItem: function(obj,type){
            var html,newHtml,element;

            // Create HTML string with placeholder string
            if(type === "inc"){      
                element = DOMStrings.incomeContainer;      
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"> <div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }            
            else if(type === "exp"){
                element = DOMStrings.expensesContainer;      
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            // Replace the placehodler text with some real text
            newHtml = html.replace("%id%",obj.id);
            newHtml = newHtml.replace("%description%",obj.description);
            newHtml = newHtml.replace("%value%",formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML("beforeend",newHtml);
        },
        clearFields : function(){
            var fields;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ", "+ DOMStrings.inputValue); // querySelectorAll returns a list data type

            // As we cannot use the slice method on a list data type we will use "call" method to set the "this" keyword on the fields variable
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current,index,array){
                current.value="";
            });
            fieldsArr[0].focus();
        },

        displayPercentages : function(percentages){
            var fields = document.querySelectorAll(DOMStrings.expensesPercentagesLabel);
            
            nodeListForEach(fields, function(current,index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index]+"%";
                }
                else{
                    current.textContent = "---";
                }
            });
        },

        displayBudget : function(obj){
            var type;

            obj.budget > 0 ? type = "inc" : type = "exp"; 

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, "inc");
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, "exp");

            if(obj.percentage > 0){
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + "%";
            }
            else{
                document.querySelector(DOMStrings.percentageLabel).textContent = "---";
            }
        },

        displayMonth : function(){
            var now, year, month, monthsArr;

            now = new Date();
            year = now.getFullYear();

            month = now.getMonth(); // getMonth function returns the number from 0 to 11 as months are named from 0 to 11
            monthsArr = ["Januaray", "Februrary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

            document.querySelector(DOMStrings.dateLabel).textContent = monthsArr[month] + " " + year;
        },

        deleteListItem : function(selectorID){
            var el;
            el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        changedType : function(){
            var fields =document.querySelectorAll(
                DOMStrings.inputType + "," +
                DOMStrings.inputDescription + "," +
                DOMStrings.inputValue
            )
    
            nodeListForEach(fields,function(current){
                current.classList.toggle("red-focus");
            });
            document.querySelector(DOMStrings.inputBtn).classList.toggle("red");
        }
    }
})();

// 3. Controller (link between budget controller module and UI controller module)
var controller = (function(bdgtCtrl,uiCtrl){

    
    var setupEventListeners = function(){
        var DOM = uiCtrl.getDOMStrings();                                           // getting the DOM elements

        document.querySelector(DOM.inputBtn).addEventListener("click",ctrlAddItem); // event list. for click event
        document.addEventListener("keypress",function(event)                        // event list. for "enter" 
        {   
            if(event.keyCode === 13) // if(evnt.key === "Enter")
            { 
               ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener("click",ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener("change",uiCtrl.changedType);
    }

    var updateBudget = function(){

        // 1. calculate budget
        bdgtCtrl.calculateBudget();

        // 2. return the budget
        var budget = bdgtCtrl.getBudget();

        // 3. show budget in the UI
        uiCtrl. displayBudget(budget);
    }

    var updatePercentages = function(){

        // 1. calculate percentages
        bdgtCtrl.calculatePercentages();

        // 2. read percentages from budget controller
        var percentages = bdgtCtrl.getPercentages();
        console.log(percentages);

        // 3. update the UI
        uiCtrl.displayPercentages(percentages);
    }

    var ctrlAddItem = function(){
        var input, newItem;
        
        // 1. get input 
        input = uiCtrl.getInput();// this will gives us a object having 3 variables: type, desc and value
        

        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            console.log(input);
            // 2. add item to the budget controller 
            newItem = bdgtCtrl.addItem(input.type, input.description, input.value);

            // 3. add item to the UI
            uiCtrl.addListItem(newItem,input.type);

            // 4. clear all fields
            uiCtrl.clearFields();

            // 5. calculate and update budget
            updateBudget();

            // 6. calculate and update percentages
            updatePercentages();
        }
        
    }

    var ctrlDeleteItem = function(event){        
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete the item from data structure
            bdgtCtrl.deleteItem(type, ID);

            // 2. delete the item from the UI
            uiCtrl.deleteListItem(itemID);

            // 3. update and display the new budget
            updateBudget();
        
            // 4. calculate and update percentages
            updatePercentages();
        }
    }

    return {
        init : function(){
            console.log("Application Started");
            uiCtrl.displayBudget({
                budget : 0,
                totalInc : 0,
                totalExp : 0,
                percentage : -1
            })
            setupEventListeners();
            uiCtrl.displayMonth();
        }
    }
    
})(budgetController,UIController);
controller.init();
