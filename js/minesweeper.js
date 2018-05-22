// Set the Application
var app = angular.module('myMinesweeper', [])
	.value('globals', {
        checked : "-checked",
        unseen : "-unseen",
        peek :  "-peek",
        mine : "-mine",
        spots : [[-1, -1], [0, -1], [1, -1],[-1, 0],[1, 0],[-1, 1], [0, 1], [1, 1]]

    })
	.controller('minesweeper', function($scope, globals) {
			    
	    // Initial Variables
	    $scope.length = 8;
	    $scope.width = 8;
	    $scope.numberMines = 10;
	    $scope.cheat = 0;
	
		// New Game - Clear Everything
	    $scope.newGame = function() {
	        $scope.gameComplete = false;
	        $scope.type = $scope.createBoard();
	        $scope.minesLocations = $scope.addMines();
	        $scope.addNumbers();
	    }
	
		// End Game - Reveals the game board 
	    $scope.endGame = function(win) {
	        for (var i = 0; i < $scope.width; i++) {
	            for (var j = 0; j < $scope.length; j++) {
	                var cell = $scope.extractCell(j, i);
	                cell.type = cell.value;
	                cell.text = $scope.getValue(cell.type);
	            }
	        }
	        if(win){
		        alert( "You Win" );
	        }else{
		        alert( "You Lose" );
	        }
	        
	    }
	    
	     // Create New Board
		$scope.createBoard = function() {
		    var tr = [];
		    for (var i = 0; i < $scope.width; i++) {
		        tr[i] = [];
		        for (j = 0; j < $scope.length; j++) {
		        	var item = { id: 'cell-' + j + '-' + i, value: "", type: globals.unseen, text: "" };
		            tr[i].push(item);
		        }
		    }
		    return tr;
		}
		   
		// Get Value of Cell 
		$scope.getValue = function(type) {
		    if(type == 0) {
		        return '';
		    }
		    if (type != globals.mine) {
		        return '' + type;
		    }
		    return '';
		}
		
		// Get Cell by Dimensions
	    $scope.extractCell = function(x, y) {
	        if ($scope.type[y] && $scope.type[y][x]) {
	            return $scope.type[y][x];
	        }
	        return;
	    }
		// Get Cell by Click
	    $scope.getCell = function(item) {
	        var dimensions = item.currentTarget.id.split('-');
	        var i = parseInt(dimensions[1]);
	        var j = parseInt(dimensions[2]);
	        
	        var type = $scope.type[j][i];
	        return [type, i, j];
	    }
		
		
		// Add Mines on Board
		$scope.addMines = function() {
		    var mines = {}
		    
		    for (var v = 0; v < $scope.numberMines; v++) {
		        var valid = 0;
		        var j = 0;
		        var i = 0;
		        while (!valid) {
		            j = Math.floor(Math.random($scope.length) * $scope.length);
		            i = Math.floor(Math.random($scope.width) * $scope.width);
		
		            if(!(mines[i] && mines[i][j])){
		            	valid = true;
		            }
		        }
		        if (!mines[i]) {
		            mines[i] = {}
		        }
		        mines[i][j] = 1;
		    }
		    return mines;
		}
	
		// Add Values to the Position
	    $scope.addNumbers = function() {
	        for (var y = 0; y < $scope.width; y++) {
	            for (var x = 0; x < $scope.length; x++) {
	                var item = $scope.extractCell(x, y);
	                if ($scope.hasMine(x, y)) {
	                    item.value = globals.mine;
	                }else {
	                    item.value = $scope.numNearByMines(x, y);
	                }
	            }
	        }
	    }
	    
	    // See if position has mine
	    $scope.hasMine = function(x, y) {
	        if($scope.minesLocations[y] && $scope.minesLocations[y][x]){
		        return true;
	        }
	    }
		
		// Get Number of Mines nearby and set cell
	    $scope.numNearByMines = function(x, y) {
	        var v = 0;
	        for (var i = 0; i < globals.spots.length; i++) {
	            if ($scope.hasMine(globals.spots[i][0] + x, globals.spots[i][1] + y)) {
	                v++;
	            }
	        }
	        return v;
	    }
	
		// 
	    $scope.expandAt = function(x, y) {
	        var cell = $scope.extractCell(x, y);
	
	        if (cell && cell.type == globals.unseen && !$scope.hasMine(x, y)) {
	            cell.type = cell.value;
	            cell.text = $scope.getValue(cell.type);
	
	            if (cell.value == 0) {
	                var spotsNearBy = []
	                for (var i = 0; i < globals.spots.length; i++) {
	                    var nx = x + globals.spots[i][0];
	                    var ny = y + globals.spots[i][1];
	                    if (nx >= 0 && nx <= $scope.length && ny >= 0 && ny <= $scope.width) {
	                        spotsNearBy.push([nx, ny]);
	                    }
	                }
	                return spotsNearBy;
	            }
	        }
	        return;
	    }
	
		// Left Click - Reveal Position & Expand Area if Select on non-number
	    $scope.leftClick = function($event) {
	        var info = $scope.getCell($event);
	        var item = info[0];
	        var x = parseInt(info[1]);
	        var y = parseInt(info[2]);
	        
	        if (item.type == globals.unseen) {
	            if ($scope.hasMine(x, y)) {
	                $scope.endGame();
	                return;
	            }
	            
	            var area = [[x, y]]
	            var pushedOut = {}

	            while (area.length) {
	                var ti = area.shift();

	                var nearby = $scope.expandAt(ti[0], ti[1]);
	                if (nearby) {
	                    for (var i = 0; i < nearby.length; i++) {
	                        if (!pushedOut[nearby[i].toString()]) {
	                            area.push(nearby[i]);
	                        }
	                    }
	                }
	                pushedOut[ti.toString()] = 1;
	            }
	 
	        }
	    }
	    
	    // Right Click - Smilie Face Check for Validation
		$scope.rightClick = function($event) {
	        var info = $scope.getCell($event);
	        var item = info[0];
	        var i = parseInt(info[1]);
	        var j = parseInt(info[2]);
	        	        
	        if($scope.hasMine(i, j) && item.type == globals.checked && $scope.cheat % 2 != 0){
		        item.type = globals.peek;
	        }else if (item.type == globals.checked) {
	            item.type = globals.unseen;
	        }else if(item.type == globals.unseen || item.type == globals.peek){
	            item.type = globals.checked;
	        }
	    }
		
		// Validate - Check if mines are correctly right clicked
	    $scope.validate = function() {
	        for (var i = 0; i < $scope.width; i++) {
	            for (var j = 0; j < $scope.length; j++) {
	                var cell = $scope.extractCell(j, i);
					// Checked and No Mine or Not Check and Mine - End
	                if (cell.type == globals.checked && !$scope.hasMine(j, i) || ($scope.hasMine(j, i) && cell.type != globals.checked)) {
	                    $scope.endGame(false);
	                    return;
	                }
	            }
	        }
	        $scope.endGame(true);
	        return;
	    }
		
		// Peek and Cheat to see mines
	    $scope.peek = function() {
	        for (var y in $scope.minesLocations) {
	            for (var x in $scope.minesLocations[y]) {
	                var item = $scope.extractCell(x, y);
	                
	                if (item.type == globals.unseen) {
	                    item.type = globals.peek;
	                } else if (item.type == globals.peek) {
	                    item.type = globals.unseen;
	                }
	                
	            }
	        }
	        $scope.cheat++;
	        return;
	    }
	
	    // Initialize New Game
	    $scope.newGame();
	
	})
	.directive('ngRightClick', function($parse) { // Add directive to right click - via Angular JS
	    return function(scope, element, attrs) {
	        var fn = $parse(attrs.ngRightClick);
	        element.bind('contextmenu', function(event) {
	            scope.$apply(function() {
	                event.preventDefault();
	                fn(scope, {$event:event});
	            });
	        });
	    };
	});
	
