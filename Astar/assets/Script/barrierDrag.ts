/**
 *   拖拽障碍物到
 */

import { leftButtomStatPos, tableData, tiledSize } from "./DataConfig";
import Game from "./game";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BarrierDrag extends cc.Component {

    /**
     * 是否在地图中
     * 
     */
    isInMap:boolean=false
    startPos:cc.Vec3

    @property(cc.Node)
    barrierLayer:cc.Node

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.node.on(cc.Node.EventType.TOUCH_START,(event:cc.Event.EventTouch)=>{
             cc.log('---TOUCH_START---')

              cc.log('---convertToNodeSpaceAR---',this.node.convertToNodeSpaceAR(cc.v2(100,100)))
              cc.log('---convertToNodeSpace---',this.node.convertToNodeSpace(cc.v2(100,100)))
              cc.log('---convertToWorldSpace---',this.node.convertToWorldSpace(cc.v2(100,100)))
              cc.log('---convertToWorldSpaceAR---',this.node.convertToWorldSpaceAR(cc.v2(100,100)))
              cc.log('---convertTouchToNodeSpaceAR---',this.node.convertTouchToNodeSpaceAR(event.touch))


             event.stopPropagation()
              this.audioPlay('audio/click')
            if(!this.isInMap){
             //如果不在地图中是指需要复制，那么就复制一个出来
             const  stopNode=cc.instantiate(this.node)
             stopNode.parent=this.node.parent
            //  stopNode.zIndex=this.node.zIndex-1
            }
            this.startPos=cc.v3(this.node.x,this.node.y)
            this.node.setSiblingIndex(this.node.parent.childrenCount)
        })
        this.node.on(cc.Node.EventType.TOUCH_MOVE,(event:cc.Event.EventTouch)=>{
            //  cc.log('---TOUCH_MOVE---')
            this.node.x+=event.getDeltaX()
            this.node.y+=event.getDeltaY()

        })
        this.node.on(cc.Node.EventType.TOUCH_END,(event:cc.Event.EventTouch)=>{
             cc.log('---TOUCH_END---')
             event.stopPropagation()
              this.audioPlay('audio/dragEnd')
             //如果不在地图中是指需要复制，那么就复制一个出来
             let endPos=this.getEndPosInMap()
             cc.log('---stopPos--',endPos)
             if(endPos){
                let MapPos=this.getNodeMapPos()
                this.node.name=`${MapPos.x}_${MapPos.y}`
                cc.log('---stopPos-2222-',tableData,MapPos.x,MapPos.y,this.node.name)
                this.node.position=endPos
                tableData[MapPos.y][MapPos.x]=1
                if(!this.isInMap){
                  this.node.parent=this.barrierLayer
                  this.isInMap=true
                }else{
                  let StartMapPos=this.getNodeMapPos(this.startPos.x,this.startPos.y)
                  tableData[StartMapPos.y][StartMapPos.x]=0
                }

             }else{
                 if(this.isInMap){
                    this.node.position=this.startPos
                 }else{
                     this.node.destroy()
                 }
             }
  
        })
        this.node.on(cc.Node.EventType.TOUCH_CANCEL,(event:cc.Event.EventTouch)=>{
             cc.log('---TOUCH_CANCEL---')
             this.audioPlay('audio/dragEnd')
                      //如果不在地图中是指需要复制，那么就复制一个出来
                      let endPos=this.getEndPosInMap()
                      cc.log('---stopPos--',endPos)
                      if(endPos){
                         let MapPos=this.getNodeMapPos()
                         this.node.position=endPos
                         tableData[MapPos.x][MapPos.y]=1
                         this.node.name=`${MapPos.x}_${MapPos.y}`
                         cc.log('---stopPos-2222-',tableData,MapPos.x,MapPos.y,this.node.name)
                         if(!this.isInMap){
                           this.node.parent=this.barrierLayer
                           this.isInMap=true
                         }else{
                           let StartMapPos=this.getNodeMapPos(this.startPos.x,this.startPos.y)
                           tableData[StartMapPos.x][StartMapPos.y]=0
                         }
         
                      }else{
                          if(this.isInMap){
                             this.node.position=this.startPos
                          }else{
                              this.node.destroy()
                          }
                      }
           
        })

    }



   /**
    * 判断是否可以 放置
    *   只能房子 表格的空格中
    *  */ 
    getEndPosInMap(x?:number,y=0){

             let gameCom=cc.find("Canvas/gameLayer").getComponent(Game)
             let hasList=[gameCom.playerMapPos]

             for(let line=0;line<tableData[0].length;line++){
                 for(let row=0;row<tableData.length;row++){
                     if(tableData[row][line]>0){
                        hasList.push(cc.v2(line,row))
                     }
                 }
             }

             let MapPos=cc.v2(x,y)
           
             if(x===undefined){
                 MapPos= this.getNodeMapPos()
             }

             if(MapPos){
                let index=hasList.findIndex(item=>(item.x===MapPos.x && item.y===MapPos.y))
                if(index<0){
                    return cc.v3(leftButtomStatPos.x+MapPos.x*tiledSize.width+tiledSize.width/2,leftButtomStatPos.y+MapPos.y*tiledSize.height+tiledSize.height/2)
                }
             }
             return null
    }

    /**
     *  判断节点在地图中的位置 不在地图内，返回null
     */
    getNodeMapPos(x?:number,y?:number):cc.Vec2|null{
             x=x??this.node.x
             y=y??this.node.y

             // 注意 *** 先转换为世界坐标  世界坐标跟节点坐标不能简单等价，一定要转换成节点坐标才能用
             let woldPos=this.node.parent.convertToWorldSpaceAR(cc.v2(x,y))
             // 一定要加上这句
             let rootPos=cc.find("Canvas/gameLayer/MapLayer").convertToNodeSpaceAR(woldPos)
             x=rootPos.x
             y=rootPos.y

             console.log('---tableData.length--',tableData.length,x,y)
        // 这样判断，虽然写着复杂，但是比直接算出所有虚拟位置再比较效率高
            if(x>leftButtomStatPos.x && x<(leftButtomStatPos.x+tableData[0].length*tiledSize.width) && y>leftButtomStatPos.y && y<leftButtomStatPos.y+tableData.length*tiledSize.height){
                 let x1=Math.floor((x-leftButtomStatPos.x)/tiledSize.width)
                 let y1=Math.floor((y-leftButtomStatPos.y)/tiledSize.height)
                 cc.log('mapPos=',x1,y1)
                return cc.v2(x1,y1)
            }


        return null
    }



    audioPlay(path:string,loop=false){
        return new Promise((resolve, reject) => {
        cc.resources.load(path,cc.AudioClip,null,(err, clip:cc.AudioClip)=>{
            if(err){
                cc.error(`加载${path}失败`)
                reject(err)
                return
            }
         const id=   cc.audioEngine.playEffect(clip,loop)
         resolve(id)
        } )
      })
    }


    // update (dt) {}
}
