currentNode = 0;

function run() {

  var margin = {top: 140, right: 50, bottom: 140, left: 50},
    width = 420 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  var nodeWidth = 80, nodeHeigh = 40;

  var json = {
      text: "Action 1",
      "children": [
        {
          text: "Action 2",
          message: 'UPDATED',
          next: 1,
          "children": [
            {
              text: "Action 3"
            },
            {
              text: "Action 4",
              message: 'REMOVED'
            }
          ]
        }
      ]
    }
  ;

  var root = d3.hierarchy(json, function (d) {
    return d.children;
  });
  root.x0 = height / 2;
  root.y0 = 0;

  var svg = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  // Compute the layout.
  tree = d3.tree().size([width, height]),
    treeData = tree(root),
    nodes = treeData.descendants();

  // Create the link lines.
  svg.selectAll(".link")
    .data(tree(root).links())
    .enter().append("path")
    .attr("class", "link")
    .attr("d", d3.linkVertical()
      .x(function (d) {
        return d.x;
      })
      .y(function (d) {
        return d.y;
      }));

  var text = svg.append("text");
  text.text("[MESSAGE]")
    .attr('x', nodes[0].x + nodeWidth * .7)
    .attr('y', nodes[0].y);

  // Create the node circles.
  svg.selectAll(".node")
    .data(nodes)
    .enter().append("rect")
    .attr("class", "node")
    .attr("width", nodeWidth)
    .attr("height", nodeHeigh)
    .attr("x", function (d) {
      return d.x - nodeWidth / 2
    })
    .attr("y", function (d) {
      return d.y - nodeHeigh / 2
    });

  svg.selectAll(".nodeText")
    .data(nodes)
    .enter().append("text")
    .attr("x", function (d) {
      return d.x
    })
    .attr("y", function (d) {
      return d.y
    })
    .text(function (d) {
      return d.data.text;
    })
    .attr("text-anchor", "middle");


  var pathFunction = d3.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .curve(d3.curveLinear);

  function translateAlong(path) {
    var l = path.getTotalLength();
    return function(i) {
      return function(t) {
        var p = path.getPointAtLength(t * l);
        return "translate(" + p.x + "," + p.y + ")";//Move marker
      }
    }
  }

  document.getElementById("click").onclick = function () {
    let offsetX = text.attr('x') - nodeWidth * .7;
    var next = currentNode + 1;
    if (nodes[currentNode].data.next) {
      next += nodes[currentNode].data.next;
    }
    var path = svg.append("path")
    // .data([[nodes[0], nodes[1]]])
      .data([[{x: nodes[currentNode].x - offsetX, y: nodes[currentNode].y}, {x: nodes[next].x -  offsetX , y: nodes[next].y}]])
      .attr("d", pathFunction)
      .attr("class", "path");

    text.transition()
      .duration(1000)
      .attrTween("transform", translateAlong(path.node()))
      .on('end', function () {
        currentNode = next;
        if (nodes[currentNode].data.message) {
          text.text("[" + nodes[currentNode].data.message + "]")
        }
      });


  }
}
