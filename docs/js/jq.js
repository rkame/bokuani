// JavaScript Document

//ページトップへ
$(function(){
$(window).scroll(function(){
if($(this).scrollTop()>600){
$(".change").addClass("topbut2");
}
else{
$(".change").removeClass("topbut2");
}
});
  $('.toTop').click(function () {
    $('body,html').animate({
      scrollTop: 0
    }, 800);
    return false;
  });
  
  
  $('.flexslider').flexslider({
	animation:"slide",
	start: function(slider){
	  $('body').removeClass('loading');
	}
  });

});


 twttr.widgets.createTimeline(
  {
    sourceType: "profile",
    screenName: "bokuani1"
  },
  document.getElementById("container")
);

