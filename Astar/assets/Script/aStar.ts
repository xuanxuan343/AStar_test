import { tableData } from "./DataConfig"
import { bindShowFindPos } from "./game"


const  enum DirectionType{
    FOURTH_DIR,
    EIGHT_DIR
}

export class AStartStep{
    g:number=0
    h:number=0
    private _f:number
    get f(){
        return this.g+this.h
    }
    set f(n){
        this._f=n
    }

    pos:cc.Vec2=cc.v2()

    last:AStartStep=null

    constructor(MapPos){
        // if(arguments.length>0 && arguments[0] instanceof cc.Vec2){
        //     this.pos=arguments[0]
        // }
        this.pos=MapPos

    }

    equalTo(other:AStartStep){
        if(other instanceof AStartStep){
            return this.pos.x===other.pos.x && this.pos.y===other.pos.y
        }
    }

}

export class AStar{

        _moveDirection=DirectionType.EIGHT_DIR
         _isShowProcess=false
        _openList:AStartStep[]
        _closeList:AStartStep[]

        constructor(){
            this._openList=[]
            this._closeList=[]
        }

        private  findeIndexOfStepList=(v:cc.Vec2,stepList:AStartStep[])=> {

             for(let i=0;i<stepList.length;i++){
                 if(v.x===stepList[i].pos.x && v.y===stepList[i].pos.y) 
                    return i
             }
             return -1
        }  

        insetStepToOpen(step:AStartStep){
            let i=0
            for(;i<this._openList.length;++i){

                if(step.f<=this._openList[i].f){
                    break
                }
            }
          
            // cc.log('---ToOpen----',i,step.f,step.pos.x,this._openList[i]?.f,this._openList[i]?.pos.x)

            this._openList.splice(i,0,step)
        }

        setIsShowProcess(_isShowProcess:boolean){
            this._isShowProcess=_isShowProcess
        }


        changeDeriction(){
              this._moveDirection=this._moveDirection===DirectionType.EIGHT_DIR?DirectionType.FOURTH_DIR:DirectionType.EIGHT_DIR
        }

        //每个砖块的消耗
        _costToMoveStep(left,right){
            // 不是直走
            return (left.x !==right.x ) && left.y!==right.y ?14:10
        }

        _getH(current,finish){
                return (Math.abs(current.x-finish.x)+Math.abs(current.y-finish.y))*10
        }

        // 判断是否

        // 获得可加入的点  zhe一步不管是否已经加入到开放列表，只管周围是否可通行
        _getNextCanMovePos(currentPos){

             let funPushPos=(pos,list)=>{
                if(tableData[pos.y][pos.x]===0){
                    list.push(pos)
                }
             }

            let results=[]
             let left=cc.v2(currentPos.x-1,currentPos.y)
             if(left.x>=0){
                 // 左三
                funPushPos(left,results)
                if(this._moveDirection===DirectionType.EIGHT_DIR){
                 let  leftTop=cc.v2(currentPos.x-1,currentPos.y+1)
                 if(leftTop.y<tableData.length){
                     funPushPos(leftTop,results)
                 }
                 let leftBottom=cc.v2(currentPos.x-1,currentPos.y-1)
                 if(leftBottom.y>=0){
                    funPushPos(leftBottom,results)
                 }
                }

             }
             // 右三
             let right=cc.v2(currentPos.x+1,currentPos.y)
             if(right.x<tableData[0].length){
                 // 左三
                funPushPos(right,results)
                if(this._moveDirection===DirectionType.EIGHT_DIR){
                 let  rightTop=cc.v2(currentPos.x+1,currentPos.y+1)
                 if(rightTop.y<tableData.length){
                     funPushPos(rightTop,results)
                 }
                 let rightBottom=cc.v2(currentPos.x+1,currentPos.y-1)
                 if(rightBottom.y>=0){
                    funPushPos(rightBottom,results)
                 }
                 
                }

             }
             // 上下
             let top=cc.v2(currentPos.x,currentPos.y+1)
             if(top.y<tableData.length){
                funPushPos(top,results)
             }
             let bottom=cc.v2(currentPos.x,currentPos.y-1)
             if(bottom.y>=0){
                funPushPos(bottom,results)
             }
            return results
        }



        async findePaths(start,finish){
            cc.log('----start--finish-',start,finish)
                this._openList=[]
                this._closeList=[]
                let  tempOpenPos=[]

                let paths=[]
                this._openList.push(new AStartStep(start))
                let pathFound=false

                do{
                    let currentStep=this._openList.shift()
                    this._closeList.push(currentStep)
                    if(this._isShowProcess){
                        await this.sleep(100)
                        this.findPos(currentStep.pos)
                    }
               
                    // cc.log('----currentStep-',currentStep.pos.x,currentStep.pos.y)

                    if(currentStep.pos.x===finish.x && currentStep.pos.y===finish.y){
                        pathFound=true 
                        do{
                            // to do 测试效率
                            paths.unshift(currentStep.pos)
                            currentStep=currentStep.last
                        }while(currentStep!==null)
                        // this._closeList=[]
                        // this._openList=[]
                        break
                    }
                    // 根据当前点，找到下一个点
                    let canMoveList=this._getNextCanMovePos(currentStep.pos)
                    // 找到需要加列表的点加入后比较
                    for(let i=0;i<canMoveList.length;++i){
                         let pos1=canMoveList[i]
                         if(this.findeIndexOfStepList(pos1,this._closeList) !=-1){
                             canMoveList.splice(i,1)
                             i--;
                             continue
                         }
                         // 不在的话，判断是否放入开放列表中
                         let  step=new AStartStep(pos1)
                         let  costMove=this._costToMoveStep(pos1,currentStep.pos)
                         let  openIndex=this.findeIndexOfStepList(pos1,this._openList)
                         if(openIndex===-1){
                             step.last=currentStep
                             step.g=currentStep.g+costMove
                             step.h=this._getH(pos1,finish)
                             this.insetStepToOpen(step)


                             tempOpenPos.push([currentStep.pos.x,currentStep.pos.y])

                         }else{
                            // 如果open列表中有的，直接用、
                            let  stepOp=this._openList[openIndex]
                            // 也可以用f 
                            if(currentStep.g+costMove<stepOp.g){
                                stepOp.g=currentStep.g+costMove;
                                stepOp.last=currentStep
                                // 先删除 再插入，因为插入事可以排序
                                this._openList.splice(openIndex,1)
                                this.insetStepToOpen(stepOp)
                            }
                         }
                    }
                }while(this._openList.length>0)

                return [pathFound,paths,tempOpenPos,this._closeList]
        }

        findPos(pos:cc.Vec2){
            // cc.log('--findPos---',pos)
        }

        private async sleep(time) {
            return new Promise((resolve) => {
              setTimeout(resolve, time);
            });
          }

}