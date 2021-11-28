

 cc.macro.CLEANUP_IMAGE_CACHE = false;
 cc.dynamicAtlasManager.enabled = true;

 //2 查看动态合图效果
 // 开启调试
// cc.dynamicAtlasManager.showDebug(true);


const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        // 1 改变左下角的debug标签颜色

            let left=cc.director.getScene().getChildByName('PROFILER-NODE').getChildByName('LEFT-PANEL')
            let right=cc.director.getScene().getChildByName('PROFILER-NODE').getChildByName('RIGHT-PANEL')
            left.color=cc.Color.YELLOW
            right.color=cc.Color.RED
      

    }

    // update (dt) {}
}
