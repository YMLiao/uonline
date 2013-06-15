function Login_Check(){
   if($.cookie('co_member')){
    yamBox_Facebook.oAuthWindow.close();
    updateUser();
    $('a.closeIt').trigger('click');
    if(window.location.href.search('post.php')==-1)
      location.reload(); 

    //window.location.reload();
  }
}
function logout(){
  $.cookie('member',null,{path: '/', domain: '.yam.com' });
  $.cookie('co_member',null,{path:'/', domain: '.yam.com' });
  $.cookie('gcookie',null,{path: '/', domain: '.yam.com'});
  window.location.reload();
}
$(document).ready(function(){ 
  var options = { 
      success:showResponse,
      error:err,
      beforeSubmit: checkLoginFields,
      dataType:'script'
  }; 
  $('#yamLoginBtn').click(function(e){
    e.preventDefault();
    //$('#loginBox p').shake(3, 20, 500);
    $('#loginForm').submit();
  });

  $('#loginForm').submit(function() { 
      $(this).ajaxSubmit(options); 
      return false; 
  }); 
}); 
function err(res){
  alert(res);
}
function checkLoginFields(arr, $form, options){
  var curStatus=true;
  if($('#loginId',$form).val()==''){
     curStatus=false;
  }
  if($('#loginPwd',$form).val()==''){
     curStatus=false;
  }
  if(!curStatus){
     $('#loginForm ul').shake(3, 20, 500);
     return false;
  }
}
function showResponse(responseText, statusText, xhr, $form){ 
  if($.cookie('co_member')){
    updateUser();
     $('a.closeIt').trigger('click');
    if(window.location.href.search('post.php')==-1)
      location.reload(); 
  }else
    $('#loginForm ul').shake(3, 20, 500);
} 
function updateUser(){
if($('a.loveIt').size()){
  var id=$('a.loveIt:first').attr('data-postid');
}
$.ajax({
  url:'updateUserData.php',
  dataType:'json',
  data:{'id':id},
  success:function(res){
      $('a.login',$('ul.menuList')).parent().html('<a class="login done" href="javascript:logout();" title="會員登出"><i class="icon-off"></i><span>會員登出</span></a>');
      $('a.loveIt').each(function(index){
        $(this).show();
      });
  }
  });
}
function userComment(id,pid){
var comment=$('#ct'+pid).val();
if(!$.cookie('co_member')){
  $.cookie('ct_pid',pid);
  $.cookie('ct_comment',comment);
  $('a.login').trigger('click');
  return;
}
if(comment==''){
  alert("請輸入發言內容!!");
  return false;
}
$.ajax({
  url:'c.php',
  dataType:'json',
  type:'post',
  data:{
    "pid":pid,
    "id":id,
    "comment":comment
  },
  success:function(res){
    if(res.status){
      var arr=[];
      arr.push(res.item);
      showComments(pid,arr,'new');
      $('#ct'+pid).val('');
    }else{
      alert(res.msg);
    }
  }
 
});
}
function getMoreComment(obj,pid){
  var $obj=$(obj);
  var coid=$obj.attr('data-coid');
   getComment(pid,coid);
}
function preLoadComment(pid,coid){
  if($('#c'+pid).attr('data-preloaded')=="true"){
    return;
  }else{
     $('#c'+pid).attr('data-preloaded',"true");
     getComment(pid,coid);
  }
 }

function getComment(pid,coid){
    $.ajax({
      url:'getcomment.php',
      dataType:'json',
      data:{
        "pid":pid,
        "coid":coid
      },
      success:function(res){
        if(res.total>0){
          showComments(pid,res.list);
          if(res.total<=res.list.length){
            $('#addMore'+pid).hide();
          }else{
            $('a',$('#addMore'+pid)).attr('data-coid',res.list[res.list.length-1].COID);
          }
        }else{
          $('#addMore'+pid).hide();
        }
//        $('#c'+pid).mCustomScrollbar("update");
      }
    });
}
$(document).ready(function(event){
  $('button.type_dark',$('form.commentForm')).each(function(index){
    $(this).click(function(event){
      var pid,id;
      pid=$(this).attr('data-pid');
      id=$(this).attr('data-id');
      userComment(id,pid);
    });
  });
  var pid=$.cookie('ct_pid');
  var comment=$.cookie('ct_comment');
  if(pid){
    $('#ct'+pid).val(comment);
     $.cookie('ct_pid',null);
     $.cookie('ct_comment',null);
  }
//  $('figure:first a.commentIt').trigger('click');
  $('textarea',$('form.commentForm')).each(function(event){
      $(this).keydown(function(event){
      if (event.keyCode == 13) { 
        event.preventDefault();
        $('button.type_dark',$(this).parent()).trigger('click');
        return false;
      }    
      });
  });
});
function showComments(pid,list,type){
  var html='';
  var cdate
  for(var i=0;i<list.length;i++){
    html+=genCommentHtml(list[i]);
  }
  if(type=='new')
    $('div.mCSB_container',$('#c'+pid)).prepend(html);
  else
    $(html).insertBefore($('#addMore'+pid));
    //$('div.mCSB_container',$('#c'+pid)).append(html);
  $('#c'+pid).mCustomScrollbar("update");
}
function genCommentHtml(item){
   var html='';
   var cdate=item.CREATE_TIME.substring(0,10);
    html+='<li>';
    html+='<p>'+item.CONTENT+'</p>';

    html+='<time datetime="'+cdate+'">'+cdate.replace(/\-/,'/',2)+'</time>';
    html+='<span>&nbsp;'+item.NICKNAME+'</span>';
    html+='</li>';
    return html;
}
// JavaScript Document