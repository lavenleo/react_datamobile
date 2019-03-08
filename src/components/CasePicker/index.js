import React ,{ Component } from 'react'
import { Modal,Button,Tag,Radio,InputItem,List } from 'antd-mobile';
import Super from './../../super'
import './index.css'
import Units from './../../units'
const RadioItem = Radio.RadioItem;

export default class CasePicker extends Component{

    state={
        caseModal: false,
        caseList:"",
        changeselset:0,
        radiotvalue:"",
        changeTag:false,
        ikey:[],
        ss:[]
    }
    showModal = (formList) => (e) => {
        e.preventDefault(); // 修复 Android 上点击穿透
        let caseList=formList.value
        const optGroupId=formList.optionKey.split("@")[0]
        const num=formList.optionKey.split("@")[1]
        let {ss}=this.state
        if(caseList){
            ss=caseList.split("->")
            ss=Units.uniq(ss)
        }
        this.setState({
            caseModal: true,
            caseList,
            changeselset:0,
            radiokey:"",
            num,
            radiotvalue:"",
            ss,
        });
        this.getcaseList(optGroupId)
    }
    
    getcaseList=(optionKey)=>{
        let {ikey}=this.state
        if(typeof optionKey==="string"){
            ikey.push(parseInt(optionKey))
            this.setState({ikey})
        }       
        //ikey=Units.uniq(ikey).sort((a,b)=>a-b)
        Super.super({
			url:`/api/field/cas_ops/${optionKey}`,                
		}).then((res)=>{
			const ops=[]
            res.options.map((item)=>{
                const op={}
                op["value"]=item.title
                op["label"]=item.title
                op["key"]=item.id
                ops.push(op)
                return false
            })
            this.setState({
                options:ops,
            })
		})
    }
    onChangeTag=(selected,index,radiokey)=> {
        let {radiotvalue,ikey}=this.state
        const arr=radiotvalue.split("->")
        const arr2=[]
        const keys=[]
        let res=""
        if(index>0){   //点击tag.删除点击tag之后的数据
            for(let i=0;i<index;i++){
                arr2.push(arr[i])
            }
            res=arr2.join("->")
        }
        for(let i=0;i<=index;i++){
            keys.push(ikey[i])
        }
        this.getcaseList(radiokey)
        this.setState({
            changeselset:index,
            changeTag:true,
            radiotvalue:res,
            ikey:keys
        })   
    }
    onRadioChange=(radiokey,radiovalue) => {
        let {caseList,radiotvalue,num,changeselset,ikey,ss}=this.state
        let changenum=changeselset
        if(radiotvalue){
            if(ss.length===parseInt(num)){
                const arr=radiotvalue.split("->")
                arr.splice(num-1,1,radiovalue)
                radiotvalue=arr.join("->")
                caseList=radiotvalue
            }else{
                caseList=radiotvalue+"->"+radiovalue
                radiotvalue=radiotvalue+"->"+radiovalue
                ikey.push(radiokey)
                changenum++
            }
        }else{
            caseList=radiovalue
            radiotvalue=radiovalue
            ikey.push(radiokey)
            changenum++
        }
        if(caseList){
            ss=caseList.split("->")
            ss=Units.uniq(ss)
        }
        if(radiotvalue.split("->").length<parseInt(num)){
            this.getcaseList(radiokey)
        }else if(radiotvalue.split("->").length===parseInt(num)){
            ikey.splice(parseInt(num),1,radiokey)
        }
        ikey=Units.uniq(ikey)
        this.setState({
            radiokey,
            radiotvalue,
            caseList,
            changeselset:changenum,
            ikey,
            ss,
            changeTag:false
        });
    };
    onCloseCase=()=>{
        let {caseList}=this.state
        let { formList }=this.props
        formList.value=caseList  //最后按确定键，将值传出
        this.onClose()
        this.setState({
            caseList:"",
            changeselset:0,
            radiotvalue:"",
            changeTag:false,
            ikey:[],
            ss:[]
        })
    }   
    onClose = () => {
        this.setState({
          caseModal: false,
        });
      }
    render(){
        const { formList }=this.props
        const {changeselset,caseModal,options,radiokey,changeTag,ikey,ss}=this.state       
        const {value,title,fieldId}=formList
        return (
            <div>
                <InputItem
                    value={value}
                    onClick={this.showModal(formList)}
                    placeholder={`请选择${title}`}
                    key={fieldId}
                >{title}</InputItem>
                <Modal
                    popup
                    visible={caseModal}
                    onClose={this.onClose}
                    animationType="slide-up"
                    afterClose={this.closeModal}
                    >
                    <List renderHeader={() => <div>{`请选择${title}`}</div>} className="popup-list">
                    <List.Item>
                        <div className="tag">
                            {ss.map((item,index)=>(
                                <Tag 
                                    selected={changeTag?(index===changeselset?true:false):false} //判断点击是否为当前
                                    onChange={(selected) =>this.onChangeTag(selected, index,ikey[index])} 
                                    key={index}
                                    disabled={index>changeselset?true:false}
                                    >
                                    {item}
                                </Tag>
                            ))}
                        </div>
                        </List.Item>
                        <div className="rediobox">
                            {options?options.map(i => (
                                <RadioItem key={i.key} checked={radiokey === i.key} onChange={() => this.onRadioChange(i.key,i.value)}>
                                    {i.label}
                                </RadioItem>
                            )):""}
                        </div>
                        <List.Item>
                            <Button type="primary" onClick={this.onCloseCase}>确定</Button>
                        </List.Item>
                    </List>
                </Modal>
            </div>
        )
    }
}
    