import * as THREE from 'three'
import { Mesh, TextureLoader } from 'three'
// 导入轨道控制器 (类)
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'


// 创建场景
const scene = new THREE.Scene()
// 创建相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const textureLoader = new THREE.TextureLoader()
const particlesTexture = textureLoader.load(require('../assets/textures/particles/1.png'))
// 设置相机位置 x, y, z
camera.position.set(0, 0, 10)
scene.add(camera)


const cubeGeometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({
    wireframe: true, // 设置为边框几何体，即渲染为平面多边形
})
const redMaterial = new THREE.MeshBasicMaterial({ color: '#ff0000' })

// 创建1000个立方体
let cubeArr = []
for (let i = -5; i < 5; i++) {
    for (let j = -5; j < 5; j++) {
        for (let z = -5; z < 5; z++) {
            const cube = new Mesh(cubeGeometry, material)
            cube.position.set(i, j, z)
            scene.add(cube)
            cubeArr.push(cube)
        }
    }
}

// 创建投射光线对象
/* 
    这个类用于进行raycasting（光线投射）。 光线投射用于进行鼠标拾取（在三维空间中计算出鼠标移过了什么物体）。
*/
const raycaster = new THREE.Raycaster()

// 鼠标的xy的二维对象  {x: 1, y: 1}
const mouse = new THREE.Vector2()

// 监听鼠标的位置
window.addEventListener('mousemove', (event) => {
    // console.log(event);
    mouse.x = (event.pageX / window.innerWidth) * 2 - 1 // (event.pageX / window.innerWidth) 结果0~1，再乘以2 结果0~2，-1结果-1~1
    mouse.y = -((event.pageY / window.innerHeight) * 2 - 1) // 页面的y轴与坐标的y轴正负方向相反
    /* 
        .setFromCamera ( coords : Vector2, camera : Camera ) : undefined
        coords —— 在标准化设备坐标中鼠标的二维坐标 —— X分量与Y分量应当在-1到1之间。
        camera —— 射线所来源的摄像机。
    */
    raycaster.setFromCamera(mouse, camera)
    /* 
        .intersectObjects ( objects : Array, recursive : Boolean, optionalTarget : Array ) : Array
        objects —— 检测和射线相交的一组物体。
        recursive —— 若为true，则同时也会检测所有物体的后代。否则将只会检测对象本身的相交部分。默认值为true。
        optionalTarget —— （可选）设置结果的目标数组。如果不设置这个值，则一个新的Array会被实例化；如果设置了这个值，则在每次调用之前必须清空这个数组（例如：array.length = 0;）。

检测所有在射线与这些物体之间，包括或不包括后代的相交部分。返回结果时，相交部分将按距离进行排序，最近的位于第一个），相交部分和.intersectObject所返回的格式是相同的。
    */
    let result = raycaster.intersectObjects(cubeArr)
    /* 
        result: []
        distance —— 射线投射原点和相交部分之间的距离。
        point —— 相交部分的点（世界坐标）
        face —— 相交的面
        faceIndex —— 相交的面的索引
        object —— 相交的物体
        uv —— 相交部分的点的UV坐标。
        uv2 —— Second set of U,V coordinates at point of intersection
        normal - 交点处的内插法向量
        instanceId – The index number of the instance where the ray intersects the InstancedMesh
    */
    console.log(result);
    // result[0] && (result[0].object.material = redMaterial) // 改变相交的物体的材质
    result.forEach(item => { item.object.material = redMaterial })
})




// 初始化渲染器
const renderer = new THREE.WebGLRenderer()
// 设置渲染的尺寸大小
renderer.setSize(window.innerWidth, window.innerHeight)
// 将webgl渲染的canvas内容添加到body上
document.body.appendChild(renderer.domElement)

// 创建轨道控制器
const controls = new OrbitControls(camera, renderer.domElement)
// 开启控制器阻尼，更有真实效果，有惯性（设置的同时还需要在render请求动画函数中设置update更新方法才会生效）
controls.enableDamping = true

// 设置坐标轴辅助器 AxesHelper( size : Number ) 代表轴的线段长度，默认为1
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// 设置时钟
const clock = new THREE.Clock()
window.addEventListener('dblclick', () => {
    // 判断是否全屏，全返回全屏的元素，不全返回null
    const fullScreenElement = document.fullscreenElement
    // 双加控制屏幕全屏和退出全屏
    if (fullScreenElement == null) {
        renderer.domElement.requestFullscreen() // 找到画布设置全屏
    } else {
        document.exitFullscreen() // 退出全屏
    }
})

const render = () => {
    let time = clock.getElapsedTime()
    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(render) // 请求动画会给render传递一个时间，为当前请求动画帧执行的毫秒数
}
render()

// 监听页面尺寸变化，更新渲染页面
window.addEventListener('resize', () => {
    // 更新摄像头的位置
    camera.aspect = window.innerWidth / window.innerHeight
    // 更新摄像机的投影矩阵
    camera.updateProjectionMatrix()
    // 更新渲染器
    renderer.setSize(window.innerWidth, window.innerHeight)
    // 设置渲染器的像素比
    renderer.setPixelRatio(window.devicePixelRatio)
})

