var yearNum=0,
    selData=-1,
    maxWeight=-100000,
    minWeight=+100000,
    maxW=-1000,
    minW=+1000,
    maxH=-1000,
    minH=+1000,
    clusterCount=0,
    clus=new Array(40),
    rscaleRange=[3,30],
    rscaleUser=[3,30],
    domainR=[1,1],
    myColorScaleUser=[0,2],
    colorList={1:"#FF0000", 2: "#D2691E", 3: "#00FF00", 4: "#A020F0", 5: "#0000FF",
    6: "#FFFF00", 7: "#FFC0CB", 8: "#A52A2A", 9: "#FFA500", 10:  "#006400", 11:"#00FFFF", 12:"#00A5FF", 
    13:"#BBFD30", 14:"#808000", 15:"#FF69B4", 16:"#A0522D", 17:"#008080", 18:"#FF00A5", 19:"#C0C0C0", 20:"#008000",
    21:"#E52B50",22:"#702963"},
    bodyColor="rgb(224, 224, 224)",
    isClusterBase=true,
    isFit=false,
    isFisheye=false,
    context,
    redraw = false,
    width2 = 1000,
    height2 = 500,
    legendSze= 1100,
    hOffset=10, wOffset=10,
    margin = {top: 5.5, right: 19.5, bottom: 12.5, left: 39.5},
    gradient = [
      [
        0,
        [0,0,255]
      ],
        [
        25,
        [0,255,255]
      ],
      [
        50,
        [0,255,0]
      ],
        [
        75,
        [255,255,0]
      ],
      [
        100,
        [255,0,0]
      ]
    ],
    yearList=["1991-1995","1996-2000","2001-2005","2006-2010","2011-2015"],
    sliderWidth = 500,
    clusterCount=0,
    dataCount=0,
    xscale,
    yscale,
    xAxis,
    yAxis,
    isFisheyeNotFixed=false,
    node,
    rscale,
    graph1,
    clusterData,
    graph2,
    arrFilter=[];



$(".yearselector li a").click(function(d){
  $(this).parents("#yearData").find('.btn4').html($(this).text());
  $(this).parents("#yearData").find('.btn4').val($(this).data('value'));
  var a =$(".yearselector li a").index($(this));
  setYear(a);
});


$(".dataselector li a").click(function(d){
  $(this).parents("#data").find('.btn4').html($(this).text());
  $(this).parents("#data").find('.btn4').val($(this).data('value'));
  selData =$(".dataselector li a").index($(this));
  $("#yearset").html("Select year");

  $(".ScoreBtn").hide();
  $("#clusterTab").addClass('active');
  $("#scoreTab").removeClass('active');
  isClusterBase=true;
  getData(selData+1);
});

for (var i = 0; i < clus.length; ++i) { clus[i] = true; }




//Append a SVG to the body of the html page. Assign this SVG as an object to svg
var board = document.getElementById("board");
setFisheye();

//
var svg = d3.select(board).append("svg")
    .attr("class", "svgGroup")
    .attr("width", width2+ margin.left + margin.right)
    .attr("height", height2+ margin.top + margin.bottom).append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


creatColorSlider();
function creatColorSlider(){

$( "#color-slider" ).slider({
    min: 0,
    max: 2,
    step: 0.1,
    values: [0, 2],
    range:true,
    slide: function( event, ui ) {
      myColorScaleUser=ui.values;
      if(isFit) setMinsMaxsColor();
      autoFit();
      draw2();
      $(".onTop3").html(ui.values[0]).css('left', (-22) + '%');
      $(".onTop4").html(ui.values[1]).css('left', 112 + '%');

    }
}).each(function() {
    var opt = $(this).data().uiSlider.options,
        vals = opt.max - opt.min;
    var st=$('<label class="onTop3">' + 0 + '</label>').css('left', (-22) + '%'),
        en=$('<label class="onTop4">' + 2 + '</label>').css('left', (112) + '%');
    $("#color-slider").append(st);
    $("#color-slider").append(en);
});

}
$("#slider-node").slider({
    range: true,
    min: 0,
    max: 100,
    step: 5,
    values: [0, 100],
    
    slide: function (e, ui) {
      var index=[dataCount-Math.floor(ui.values[1]/100*dataCount), dataCount-Math.floor(ui.values[0]/100*dataCount)-1];
      rscaleUser=[rscale(graph1[index[1]].weight1), rscale(graph1[index[0]].weight1)];
      if(isFit){
        if(isClusterBase) setMinsMaxsNode();
        else setMinsMaxsColor();
      }
      autoFit();
      draw2();
      $(".onTop1").html(ui.values[0]+'%').css('left', -22 + '%');
      $(".onTop2").html(ui.values[1]+'%').css('left', 112 + '%');
    }
}).each(function() {
    var opt = $(this).data().uiSlider.options;
    var vals = opt.max - opt.min;
/*    for (var i = 0; i <= vals; i=i+20) {
      var el = $('<label class="onBott">' + (i + opt.min) + '</label>').css('left', (i/vals*100) + '%');
      $("#slider-node").append(el);
    }*/
    var st=$('<label class="onTop1"> 0% </label>').css('left', (-22) + '%'),
        en=$('<label class="onTop2"> 100% </label>').css('left', (1*112) + '%');
    $("#slider-node").append(st);
    $("#slider-node").append(en);
});



function getData(dataFile){




  d3.select(".svgGroup").remove();
  d3.select(".legend").remove();

  svg = d3.select(board).append("svg")
    .attr("class", "svgGroup")
    .attr("width", width2+ margin.left + margin.right)
    .attr("height", height2+ margin.top + margin.bottom).append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
}

function searchNode(arr) {

    var selectedVal = document.getElementById('search').value;
    var node = svg.selectAll(".node");
    d3.selectAll(".node").style("opacity", 1);
    if (selectedVal !="") {
        d3.selectAll(".node").style("opacity", 0.1);
        var selected = node.filter(function (d, i) {
          for(i=0; i<arr.length; i++)
              if(d.label == arr[i].label) 
                return true;
          return false;
        });
        selected.style("opacity", "1.0");
        //d3.selectAll(".node").transition().duration(5000).style("opacity", 1);
    }
}

//document.getElementById('download').addEventListener('click', download, false);
function draw2(){

   d3.select(".svgGroup").remove();
  d3.select(".legend").remove();
  svg = d3.select(board).append("svg")
    .attr("class", "svgGroup")
    .attr("width", width2+ margin.left + margin.right)
    .attr("height", height2+ margin.top + margin.bottom).append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.on("dblclick", function() {
    if(isFisheye) isFisheyeNotFixed=!isFisheyeNotFixed;
  });

  // Add a background rect for mousemove.
    svg.append("rect")
        .attr("class", "svgbackground")
        .attr("width", width2)
        .attr("height", height2)
        .style("fill", "rgb(224, 224, 224)");

  // Add the x-axis.
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis);

    // Add the y-axis.
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

   // Add an x-axis label.
    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width2 - 6)
        .attr("y", height2 - 6)
        .text("");

    // Add a y-axis label.
    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("x", -6)
        .attr("y", 6)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("");

  var circlesContainer=svg.append("g")
    .attr("class", "circlesGroup")
    .attr('display','inline');


  node = circlesContainer.selectAll(".node")
      .data(graph1)
      .enter().append("g")
      .attr("class", "node");

  node.append("circle")
      .filter(function(d){
        var selectedVal = document.getElementById('search').value;
        if (selectedVal !="") {
          var tmp=false;
          for(i=0; i<arrFilter.length; i++)
              if(d.label == arrFilter[i].label)
                tmp=true; 
          if(!tmp) return false;
        }

        if(yearNum>0 && d.year!=yearNum) return false;
        if(d.score<myColorScaleUser[0] || d.score>myColorScaleUser[1]) return false;
        if(r(d)<rscaleUser[0] | r(d)>rscaleUser[1]) {return false;}
        for(i=0; i<clus.length; i++)
              if(!clus[i] & d.cluster==i+1) {return false;}
            return true;
      })  
      .attr('r', function(d){var x=r(d); return x;})
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
      .attr('opacity', 0.8)
      .style("fill", function(d){
        if(isClusterBase) return colorList[d.cluster];
        else return getColorFromRange(d.score);
      });

  d3.selectAll("circle")
      .attr("cx", function (d) {return x(d);})
      .attr("cy", function (d) {return y(d);});

  // Positions the dots based on data.
  svg.on("mousemove", function() {
    if(isFisheyeNotFixed){
      var mouse = d3.mouse(this);
      xscale.distortion(2.5).focus(mouse[0]);
      yscale.distortion(2.5).focus(mouse[1]);
        node.call(position);
    svg.select(".x.axis").call(xAxis);
    svg.select(".y.axis").call(yAxis);
    }
  });


  //Legend
      var legend1 = document.getElementById("legend"); 
      var legend = d3.select(legend1).append("svg")
          .attr("class", "legend")
          .attr("width", legendSze)
          .attr("height", "60")
          .attr("x", 480)
          .attr("y", 0);

      var nodeItem = legend.selectAll(".legendItem")
          .data(clusterData)
          .enter().append("g")
          .attr("class", "legendItem")
          .on('click', function(d){clusterClick(d.cluster-1, this)});

      var legendItemHeight= Math.min(30, Math.floor(480/(clusterCount+1))),
          legendFontSize=Math.min(15,(legendItemHeight*2/3))+"px"
          legendRecSize=legendItemHeight*2/3;


      nodeItem.append("rect")
          .attr("rx", 6)
          .attr("ry", 6)
          .attr("y", 20)
          .attr("x", function(d){
            return 540+legendItemHeight*(d.cluster);
          })
          .attr("stroke", function(d){
            return colorList[d.cluster];
          })
          .attr("stroke-width",1)
          .attr("width", legendRecSize)
          .attr("height", legendRecSize)
          .style("fill", function(d,i){
            if(!clus[i]) return bodyColor;
            return colorList[d.cluster];
          });


      nodeItem.append("text")
                .style('fill', 'black')
                .attr("x",3)
                .attr("y", function(d){
                  return (legendItemHeight)*(d.cluster+.5);
                })
                .style("font-size",legendFontSize)
                .attr("dx", legendItemHeight)
                .html(function(d){return d.name});


if(!isClusterBase){$('.legend').hide();}


      //jqueris
$('circle').tipsy({ 
  gravity: 'w', 
  html: true, 
  title: function() {
    var d = this.__data__;
    var c = '<h4>'+d.label+'</h4>'+'<h5> Weight: '+d.weight1+'</h5>';
    if(d.score) c=c+'<h5> Score: '+Math.floor(d.score * 100) / 100+'</h5>';
    if(d.year) c=c+'<h5> Year: '+yearList[d.year-1]+'</h5>';
    
    return c; 
  }
});


}


function changeNodesPos(){
  node.call(position);
  svg.select(".x.axis").call(xAxis);
  svg.select(".y.axis").call(yAxis);
}

function zoomFun(){
  isFisheye=!isFisheye;
  if(isFisheye) isFisheyeNotFixed=true;
  autoFit();
}

function setFisheye(){
  if(isFisheye){
    xscale = d3.fisheye.scale(d3.scale.linear).domain([minW,maxW]).range([wOffset,width2-wOffset]),
    yscale = d3.fisheye.scale(d3.scale.linear).domain([maxH,minH]).range([hOffset,height2-hOffset]);
  } else{
    xscale = d3.scale.linear().domain([minW,maxW]).range([wOffset,width2-wOffset]),
    yscale = d3.scale.linear().domain([maxH,minH]).range([hOffset,height2-hOffset]);
  }
  // The x & y axes.
  xAxis = d3.svg.axis().orient("bottom").scale(xscale).tickSize(-height2),
  yAxis = d3.svg.axis().orient("left").scale(yscale).tickSize(-width2);
}

function x(d) { return xscale(d.xx);}
function y(d) { return yscale(d.yy);}
function r(d) { return rscale(d.weight1);}

function updateNodeColor(myBool){
  isClusterBase =myBool;
  
  if(isClusterBase) {
    myColorScaleUser=[0,2];

    $( "#color-slider" ).html("");


    creatColorSlider();
    
    setMinsMaxsColor();
    autoFit();
    $('.scoreBar').hide();
    $('#color-slider').hide();
    $('.legend').show();

  }
  else{
    clus=[true, true, true, true, true, true, true, true, true, true];
    setMinsMaxsNode();
    autoFit();
    $('.legend').hide();
    $('.scoreBar').show();
    $('#color-slider').show();
  }
  svg.selectAll(".node circle")
    .style("fill", function(d,i) {
      if(isClusterBase) return colorList[d.cluster];
      else return getColorFromRange(d.score);
    });
  
    draw2();
}

function setMinsMaxsNode(){
    maxW=-1000;
    minW=+1000;
    maxH=-1000;
    minH=+1000;
    
    graph1.forEach(function(d){
      if(clus[d.cluster-1] && rscale(d.weight1)>=rscaleUser[0] && rscale(d.weight1<=rscaleUser[1])){
        if (d.xx>maxW) maxW=d.xx;
        if (d.xx<minW) minW=d.xx;
        if (d.yy>maxH) maxH=d.yy;
        if (d.yy<minH) minH=d.yy;
      }  
    });
}

function resetMinsMaxs(){
    maxW=-1000;
    minW=+1000;
    maxH=-1000;
    minH=+1000;

    graph1.forEach(function(d){
      if(rscale(d.weight1)>=rscaleUser[0] && rscale(d.weight1)<=rscaleUser[1]){
        if (d.xx>maxW) maxW=d.xx;
        if (d.xx<minW) minW=d.xx;
        if (d.yy>maxH) maxH=d.yy;
        if (d.yy<minH) minH=d.yy;
      }
    });
}

function setMinsMaxsColor(){
    maxW=-1000;
    minW=+1000;
    maxH=-1000;
    minH=+1000;

    graph1.forEach(function(d){
      if(d.score>=myColorScaleUser[0] && d.score<=myColorScaleUser[1] 
        && d.weight1>=rscaleUser[0] && d.weight1<=rscaleUser[1]){
        if (d.xx>maxW) maxW=d.xx;
        if (d.xx<minW) minW=d.xx;
        if (d.yy>maxH) maxH=d.yy;
        if (d.yy<minH) minH=d.yy;
      }  
    });
}

function render(svg, width, height) {
  document.createElement('canvas')
  var c = document.createElement('canvas');   
  c.width = width || 500;
  c.height = height || 500;
  document.getElementById('canvas').innerHTML = '';
  document.getElementById('canvas').appendChild(c);
  if (typeof FlashCanvas != "undefined") {
    FlashCanvas.initElement(c);
  }
  canvg(c, svg, { log: true, renderCallback: function (dom) {
    if (typeof FlashCanvas != "undefined") {
      document.getElementById('svg').innerHTML = 'svg not supported';
    } else {
      var svg = (new XMLSerializer()).serializeToString(dom);
      document.getElementById('svg').innerHTML = svg;
      if (overrideTextBox) {
        document.getElementById('input').value = svg;
        overrideTextBox = false;
      }
    }
  }});
}

function resize() {
  var c = document.getElementById('container');
  c.style.width = (window.innerWidth || document.body.clientWidth)+'px';
  c.style.height = (window.innerHeight || document.body.clientHeight)+'px';
  redraw = true;    
}

function saveAsPNG(){
  $("#container").show();
  if (typeof(FlashCanvas) != 'undefined') context = document.getElementById('canvas').getContext; 
      var svg1 = '<svg style="width:1100px; height:100%;">'+$('.svgGroup').html()+'</svg>';
  resize();
  canvg('canvas', svg1, {
        ignoreMouse: true,
        ignoreAnimation: true,
        forceRedraw: function() { var update = redraw; redraw = false; return update; }
      });
}

function download() {
    var dt = canvas.toDataURL();
    this.href = dt; //this may not work in the future..
    //setTimeout(function() {$("#container").hide();}, 1000);
    $("#container").hide();
}

function pickHex(color1, color2, weight) {
    var p = weight;
    var w = p * 2 - 1;
    var w1 = (w/1+1) / 2;
    var w2 = 1 - w1;
    var rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
        Math.round(color1[1] * w1 + color2[1] * w2),
        Math.round(color1[2] * w1 + color2[2] * w2)];
    return 'rgb('+rgb.join()+')';   
}

function clusterAll(){
  svg.style("display", 'inline');
  clus=[true, true, true, true, true, true, true, true, true, true];
  $(".notSelCluster").removeClass("notSelCluster");
  draw2();
}

function clusterClick(a, item){
  if(clus[a]){
    clus[a]=false;
    $(item).addClass('notSelCluster');}
  else{
    clus[a]=true;
    $( item).removeClass( "notSelCluster");
  }
  if(isFit) {setMinsMaxsNode(); autoFit();}
  draw2();
}

function autoFit(){
  setFisheye();
  changeNodesPos();
}

function getColorFromRange(score){
  var graColor={0:[0,0,255],
                1:[0,255,255],
                2:[0,255,0],
                3:[255,255,0],
                4:[255,0,0]};
  var sec=Math.floor(score/0.5);
  
  if(sec==4) return pickHex(graColor[3], graColor[4], 0);
  return pickHex(graColor[sec], graColor[sec+1], 1-(score-0.5*sec)/.5);
}

function position(dot) {
  dot.select("circle").attr("cx", function(d) { return x(d); })
      .attr("cy", function(d) { return y(d); });
}

function sortJsonArrayByProperty(objArray, prop, direction){
    if (arguments.length<2) throw new Error("sortJsonArrayByProp requires 2 arguments");
    var direct = arguments.length>2 ? arguments[2] : 1; //Default to ascending

    if (objArray && objArray.constructor===Array){
        var propPath = (prop.constructor===Array) ? prop : prop.split(".");
        objArray.sort(function(a,b){
            for (var p in propPath){
                if (a[propPath[p]] && b[propPath[p]]){
                    a = a[propPath[p]];
                    b = b[propPath[p]];
                }
            }
            return ( (a < b) ? -1*direct : ((a > b) ? 1*direct : 0) );
        });
    }
}


function changeFitOption(){
  isFit=!isFit;
  if(isFit){
    if(isClusterBase) setMinsMaxsNode();  
    else setMinsMaxsColor();
  }
  else{
    resetMinsMaxs();
  }
  autoFit();
}

function setYear(a){
if (selData==0)
  dataFileData=data1;
if (selData==1)
  dataFileData=data2;
if (selData==2)
  dataFileData=data3;
if (selData==3)
  dataFileData=data4;
if (selData==4)
  dataFileData=data5;

  //var dataFilenName="/data1-"+(selData+1)+".json";
  //Read the data from the mis element 
  //var request1 = new XMLHttpRequest();
 // request1.open("GET", "./"+dir+dataFilenName, false);
 // request1.send(null);
  graph2 = dataFileData;
  graph1=[];

$(".fieldTitle").show();
$(".weightBar").show();
$(".zoomBtn").show();
$(".fitBtn").show();



if(selData>1 && a==0) {
  $(".ScoreBtn").show();
  if(!isClusterBase){
    $(".scoreTitle").show();
    $(".scoreBar").show();
    $('#color-slider').show();
  }
}
  else{
    $(".ScoreBtn").hide();
    $(".scoreTitle").hide();
    $(".scoreBar").hide();
    $('#color-slider').hide();
  }

  dataCount=0;
  clusterCount=0;
  maxWeight=-100000;
  minWeight=+100000;
  maxW=-1000;
  minW=+1000;
  maxH=-1000;
  minH=+1000;
    yearNum=a;
    graph1=[];
    graph2.forEach(function(d){ 
      d['id'] = +d['id']; 
      d['cluster'] = +d['cluster'];
      d['score'] = +d['score'];
      d['weight1'] = +d['weight1'];
      if(d.year==yearNum)
        graph1.push(d);
    });

    graph1.forEach(function(d){
      if (d.weight1<minWeight) minWeight=d.weight1;
      if (d.weight1>maxWeight) maxWeight=d.weight1;
      if (d.xx>maxW) maxW=d.xx;
      if (d.xx<minW) minW=d.xx;
      if (d.yy>maxH) maxH=d.yy;
      if (d.yy<minH) minH=d.yy;
      if (d.cluster>clusterCount) clusterCount=d.cluster;
      dataCount++;
    });

    clusterData=[];
    for (i=0; i<clusterCount;i++){
      clusterData.push({"cluster":(i+1)});
    }

    sortJsonArrayByProperty(graph1, 'weight1', -1);
    domainR=[minWeight,maxWeight];
    rscale = d3.scale.linear()
    .domain(domainR)
    .range(rscaleRange);
    setFisheye();
    draw2();

    var optArray = [];
    for (var i = 0; i < graph1.length - 1; i++) {
        optArray.push(graph1[i].label);
    }

    $("#search").autocomplete({
        source: optArray,
        response: function( event, ui ) {arrFilter=ui.content; draw2();},
        select: function( event, ui ) {arrFilter=[]; arrFilter.push(ui.item); draw2();}
    });
    $("#search").keyup(function() {
        if (this.value =="")
          draw2();
    });
}