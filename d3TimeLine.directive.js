(function () {

	'use strict';

	angular.module('d3TimeLine')
		.directive('d3TimeLine', d3TimeLine);

	/* @ngInject */
	function d3TimeLine() {
		var directive = {
			restrict: 'AE',
			scope: {
				lineGraphData: '=',
				lineConfig: '='
			},
			templateUrl: 'd3TimeLine.html',
			link: function (scope, element, attrs) {

				// 0. Initialize radius, duration
				var transitionDuration = scope.lineConfig && scope.lineConfig.duration ? scope.lineConfig.duration : 1500;
				var radius = scope.lineConfig && scope.lineConfig.radius ? scope.lineConfig.radius : 7;

				// 1. Get the number of datapoints and parse date to
				var n = scope.lineGraphData.length;
				scope.lineGraphData.forEach(function (d) {
					d.y = 1; //set y-Axis to 1
					d.date = new Date(d.date);
				});

				// 2. Use the margin convention practice 
				var margin = { top: 20, right: 10, bottom: 20, left: 10 }
					, width = element[0].scrollWidth - margin.left - margin.right // Use the window's width 
					, height = 20; // Use the window's height


				// 5. X scale will use the index of our data
				var xScale = d3.scaleTime()
					.domain(d3.extent(scope.lineGraphData, function (d) {
						return d.date
					})) // input
					.range([0, width]); // output

				// 6. Y scale will use the randomly generate number 
				var yScale = d3.scaleLinear()
					.domain([0, 1]) // input 
					.range([height, 0]); // output 

				// 7. d3's line generator
				var line = d3.line()
					.x(function (d) { return xScale(d.date); }) // set the x values for the line generator
					.y(function (d) { return yScale(d.y); }) // set the y values for the line generator 
					.curve(d3.curveMonotoneX) // apply smoothing to the line

				// 8. Add the SVG to the page
				var svg = d3.select(element[0]).append("svg")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)
					.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				// 9. Call the x axis in a group tag
				svg.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + height + ")")
					.call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

				// 10. Append the path, bind the data, and call the line generator 
				svg.append("path")
					.datum(scope.lineGraphData) // 10. Binds data to the line 
					.attr("class", "line") // Assign a class for styling 
					.attr("d", line) // 11. Calls the line generator 


				// 11. Appends a circle for each datapoint 
				svg.selectAll(".dot")
					.data(scope.lineGraphData)
					.enter().append("circle") // Uses the enter().append() method
					.attr("class", "dot") // Assign a class for styling
					.on("click", handleMouseClick)
					.transition()
					.duration(transitionDuration)
					.ease(d3.easeLinear)
					.attr("cx", function (d, i) { return xScale(d.date) })
					.attr("cy", function (d) { return yScale(d.y) })
					.attr("r", radius)
					.style("fill", function (d) { console.log('color', d); return d.color; })


				function handleMouseClick(d, i) {
					scope.$apply(function () {
						if (scope.selectedDate == d) {
							scope.selectedDate = null;
						}
						else {
							scope.selectedDate = d;
						}
					})
				}
			}
		};

		return directive;
	}
})();