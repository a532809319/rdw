
/*
create fota task by did
*/
function createFotaTask(did,task_type,para_dict){
    switch(task_type){

            case "homebox_para":
                //new a task record
                //{did:did,tasktype:task_type,paras：{item:value,item:value},executed:false,result:''}
                break;
            case "home_box_img":
                break;
            case "sensor_box_img":
                break;
            default:
              console.log("Error,unknown Fota Task Type",task_type)
    }

    
}
/*
 only allow  empty parameter gateway devices sync back
*/
function updatd_parameter_from_device(did){

}

function set_gateway_para(did,para_dict){
    //-[] set parameter to DM db
    //-[] create a fota task for para
    //-[] send notification to box, if it alreay online
    //-[] if gateway is offline, send a retain message to gateway, gateway will got it when next online
}