

import { leftButtomStatPos, tableData, tiledSize } from "./DataConfig";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MapLayer extends cc.Component {

    //  onLoad(){
    //     tableData
    //  }

    graphics:cc.Graphics

    start () {
       
        this.initMap()
       
    }

   public  initMap(){
        this.graphics=this.node.getChildByName('floorLayer').getComponent(cc.Graphics)
        this.graphics.clear()
        //1.底板
        this.graphics.rect(leftButtomStatPos.x,leftButtomStatPos.y,tiledSize.width*tableData[0].length,tiledSize.height*tableData.length)
        this.graphics.fill()
        this.graphics.close()
        this.graphics.stroke()
        this.graphics.strokeColor = new cc.Color().fromHEX('#33A70A');

        // 2画地图表格
         for(let i=1;i<tableData[0].length;i++){
             for(let j=1;j<tableData.length;j++){
                  let row1=cc.v2( leftButtomStatPos.x+0,j*tiledSize.height+leftButtomStatPos.y)
                  let row2=cc.v2( leftButtomStatPos.x+tableData[0].length*tiledSize.width,j*tiledSize.height+leftButtomStatPos.y)
                 this.graphics.moveTo(row1.x,row1.y)
                 this.graphics.lineTo(row2.x,row2.y)
                  let line1=cc.v2( leftButtomStatPos.x+i*tiledSize.width,leftButtomStatPos.y)
                  let line2=cc.v2( leftButtomStatPos.x+i*tiledSize.width,tableData.length*tiledSize.height+leftButtomStatPos.y)
                 this.graphics.moveTo(line1.x,line1.y)
                 this.graphics.lineTo(line2.x,line2.y)
             }
         }

         this.graphics.stroke()

    }

  


    // update (dt) {}
}
