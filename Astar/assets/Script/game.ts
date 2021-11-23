import { AStar } from "./aStar";
import BarrierDrag from "./barrierDrag";
import { leftButtomStatPos, tableData, tiledSize } from "./DataConfig";
import MapLayer from "./mapLayer";



const {ccclass, property} = cc._decorator;

// 函数装饰器
/**
 * 绑定事件装饰器函数
 * 函数的传参尽量简洁明确
 *
 * @param amount 需要传递的参数数量
 */
 export function bindShowFindPos(amount?: number): any {
    return function (
        target: any,
        name: string,
        descriptor: PropertyDescriptor
    ): PropertyDescriptor {
        const oriFn = descriptor.value;
        descriptor.value = function (...data: any[]) {
            const ret = oriFn.apply(this, data);
            // cc.log('----测试装饰函数----',data)
            return ret;
        };
        return descriptor;
    };
}





@ccclass
export default class Game extends cc.Component {


     playerMapPos=cc.v2(3,3)  
     targetPos:cc.Vec2

     player:cc.Node
     barrier:cc.Node
     barrierLayer:cc.Node
     MapLayerNode:cc.Node
     pathLayer:cc.Node
    // onLoad () {}

    private isShowProcess= false

    private aStar:AStar

    count:number=0

    _openList=[]
    _closeList=[]

    start () {
        this.initUI()
        this.aStar=new AStar()

         //截取 aStar中的findPos 方法   为了展示查找过程的
         const originFun=this.aStar.findPos
          this.count=0
         let findexLableLayer=this.node.getChildByName("findexLableLayer")
         this.aStar.findPos=(...ret)=>{
            // originFun.apply(this,ret)
            originFun.call(this,ret)
            // cc.log('----函数劫持----',ret)
            this.count++
            let label=new cc.Node(this.count+"").addComponent(cc.Label)
            label.fontSize=20
            label.lineHeight=20
            label.string=this.count+"";
             label.overflow=cc.Label.Overflow.NONE
             label.cacheMode=cc.Label.CacheMode.BITMAP
            label.node.parent=findexLableLayer
            let labePos=this.getNodePosByMapPos(ret[0].x,ret[0].y)
            label.node.position=cc.v3(labePos.x,labePos.y)

            // 画图
            let gp=this.pathLayer.getComponent(cc.Graphics)
            let nodePos=this.getNodePosByMapPos(ret[0].x,ret[0].y)
              gp.fillRect(nodePos.x-tiledSize.width/2,nodePos.y-tiledSize.height/2,tiledSize.width,tiledSize.height)
             gp.strokeColor = new cc.Color().fromHEX('##B23FAB');
            gp.stroke()
          
      }
    }

    refreshShowLabel(){
        let findexLableLayer=this.node.getChildByName("findexLableLayer")
        findexLableLayer.removeAllChildren()
        this.count=0
    }

    initUI(){

        this.player=this.node.getChildByName("player")
        this.player.position=cc.v3(this.getNodePosByMapPos(this.playerMapPos.x,this.playerMapPos.y))
        this.MapLayerNode=this.node.getChildByName("MapLayer")
        this.barrier=this.MapLayerNode.getChildByName("UILayer").getChildByName("barrier")
        this.barrierLayer=this.MapLayerNode.getChildByName('barrierLayer')
        this.pathLayer=this.MapLayerNode.getChildByName('pathLayer')
   
        this.refreshLabe()

        // 初始化地图中的障碍物
        for(let i=0;i<tableData.length;i++){
            for(let j=0;j<tableData[0].length;j++){
                 let v=tableData[i][j]
                 if(v>0){
                     let newBarrier=cc.instantiate(this.barrier)
                     newBarrier.position=this.getNodePosByMapPos(j,i)
                     newBarrier.parent=this.barrierLayer
                     newBarrier.getComponent(BarrierDrag).isInMap=true
                 }
            }
        }

        // 监听当前点击
            this.node.on(cc.Node.EventType.TOUCH_START,(event:cc.Event.EventTouch)=>{
                    cc.log('--TOUCH_START---')
            })
            this.node.on(cc.Node.EventType.TOUCH_END,(event:cc.Event.EventTouch)=>{
                
                     let pos=this.node.convertTouchToNodeSpace(event.touch)
                     cc.log('--TOUCH_END---',event.touch.getLocation(),pos)
                     let mapPos=this.getMapPosByNodePos(pos.x,pos.y)
                     if(mapPos){
                         this.targetPos=mapPos
                         let nodePos=this.getNodePosByMapPos(mapPos.x,mapPos.y)
                         let gp=this.pathLayer.getComponent(cc.Graphics)
                         gp.clear()
                         gp.rect(nodePos.x-tiledSize.width/2,nodePos.y-tiledSize.height/2,tiledSize.width,tiledSize.height)
                         gp.fill()
                         gp.stroke()

                         this.showPathsAndMove()

                     }

            })

    }


    refreshLabe(){
        let MapLayer=this.node.getChildByName("MapLayer")
         let UILayer=MapLayer.getChildByName("UILayer")
         UILayer.position=cc.v3(this.getNodePosByMapPos(tableData[0].length+1,tableData.length-1))
         this.player.position=cc.v3(this.getNodePosByMapPos(this.playerMapPos.x,this.playerMapPos.y))
    }


    async showPathsAndMove(){

             this.refreshShowLabel()
             console.time('findPath')
            let resultList=  await this.aStar.findePaths(this.playerMapPos,this.targetPos)
            console.timeEnd('findPath')

            if(resultList[0]){
                let mapPosList=<[cc.Vec2]>resultList[1]
                
                 let gp=this.pathLayer.getComponent(cc.Graphics)

                //画openList
                // let closeList=<any[]>resultList[3]
                // // cc.log('--openList---',closeList)
                // for(let i=0;i<closeList.length;i++){
                //     let nodePos=this.getNodePosByMapPos(closeList[i].pos.x,closeList[i].pos.y)
                //     gp.fillRect(nodePos.x-tiledSize.width/2,nodePos.y-tiledSize.height/2,tiledSize.width,tiledSize.height)
                //     gp.strokeColor = new cc.Color().fromHEX('##B23FAB');
                //     gp.stroke()
                // }

                 // 画路径
                for(let i=0;i<mapPosList.length;i++){
                    let nodePos=this.getNodePosByMapPos(mapPosList[i].x,mapPosList[i].y)
                    gp.fillRect(nodePos.x-tiledSize.width/2,nodePos.y-tiledSize.height/2,tiledSize.width,tiledSize.height)
                    gp.strokeColor = new cc.Color().fromHEX('#4B64BC9A');
                    gp.stroke()

                }

                this.playerMove(mapPosList,gp)

            }else{
                cc.log('----找不到路径---')
                let tip=cc.find('Canvas/tips').getComponent(cc.Label)
                tip.node.active=true
                tip.node.scale=0
                tip.node.opacity=255
                tip.string='此路不通'
                cc.tween(tip.node)
                .to(0.3,{scale:1.2})
                .to(0.1,{scale:1})
                .delay(2)
                .to(0.5,{opacity:0})
                .call(()=>{
                    tip.node.active=false
                }).start()

            }

            cc.log('------',resultList)
    }


    playerMove(paths:[cc.Vec2],gp?:cc.Graphics){
         
        let quance=[]
        paths.forEach((v)=>{
            let move=cc.moveTo(0.2,cc.v2(this.getNodePosByMapPos(v.x,v.y)))
            quance.push(move)
        })
        let callBack=cc.callFunc(()=>{
            cc.log('---moveEnd--')
            let targetPos=paths[paths.length-1]
            this.playerMapPos=cc.v2(targetPos)
            if(gp){
                // 如果显示过程不清除
                if( this.isShowProcess) return
                 gp.clear()
            }
        })
        quance.push(callBack)
        this.player.stopAllActions()
        this.player.runAction(cc.sequence(quance))

    }


    /**
     * 节点坐标转为 地图坐标
     * @param x 
     * @param y 
     * @returns 
     */
    getMapPosByNodePos(x?:number,y?:number):cc.Vec2|null{
             x=x??this.node.x
             y=y??this.node.y

        // 这样判断，虽然写着复杂，但是比直接算出所有虚拟位置再比较效率高
            if(x>leftButtomStatPos.x && x<(leftButtomStatPos.x+tableData[0].length*tiledSize.width) && y>leftButtomStatPos.y && y<leftButtomStatPos.y+tableData.length*tiledSize.height){
                 let x1=Math.floor((x-leftButtomStatPos.x)/tiledSize.width)
                 let y1=Math.floor((y-leftButtomStatPos.y)/tiledSize.height)
                 cc.log('mapPos=',x1,y1)
                return cc.v2(x1,y1)
            }
        return null
    }


 /**
  *  地图坐标转为节点坐标
  * @param x 
  * @param y 
  * @returns 
  */
    getNodePosByMapPos(x:number,y:number){
        x=Math.floor(x)
        y=Math.floor(y)
        let nodePos=cc.v3(leftButtomStatPos.x+ x*tiledSize.width+tiledSize.width/2,leftButtomStatPos.y+ y*tiledSize.height+tiledSize.height/2)
        return nodePos
    }

        
    // 改变 寻路方向  4 向 和8向
    changeMoveDriction(){
        this.aStar.changeDeriction()
        this.refreshLabe()
    }

    changIsShowpross(){
        this.isShowProcess=!this.isShowProcess
        this.aStar.setIsShowProcess(this.isShowProcess)
    }

    addMapTable(){
         if(tableData.length<20){
             tableData.forEach((v,index)=>{
                 v.push(0)
             })
             //增加竖向
            let list=new Array(tableData[0].length).fill(0)
             tableData.push(list)
         let mapLayerCom=this.MapLayerNode.getComponent(MapLayer)
         mapLayerCom.initMap()
         this.refreshLabe()

         }

         console.log('---tableData.length--',tableData.length)
    }
    reduceMapTable(){
        cc.log('----tableData---',tableData)
        if(tableData.length>5){
            //主角重置
            this.playerMapPos=cc.v2(3,3)

           tableData.forEach((v,_index)=>{
              let num= v.splice(v.length-1,1)
         
              if(num[0]>0){
              
                // 需要删除对应的障碍物
                let Pos=cc.v2(v.length,_index)
                this.barrierLayer.children.forEach((child)=>{
                     if(child.name===`${Pos.x}_${Pos.y}`){
                         child.destroy()
                     }
                })
              }
           }
           )
           // 横向的也要删除
         let  list=   tableData.splice(tableData.length-1,1)
          list[0].forEach((v,_index)=>{
              if(v>0){
                       // 需要删除对应的障碍物
                let Pos=cc.v2(_index,tableData.length)
                this.barrierLayer.children.forEach((child)=>{
                     if(child.name===`${Pos.x}_${Pos.y}`){
                         child.destroy()
                     }
                })
              }
          })


           let mapLayerCom=this.MapLayerNode.getComponent(MapLayer)
           mapLayerCom.initMap()
           this.refreshLabe()
        }

        console.log('---tableData.length--',tableData.length)
    
    }

    exitGame(){
        cc.game.end()
    }


    // update (dt) {}
}
