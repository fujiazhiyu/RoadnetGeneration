# RoadnetGeneration
用户制作好数据（在draw a picture页面有例子）后，选择使用训练的两个模型，可以生成不同尺度（实际上是两个尺度）的路网区块
The user could make data picture (there is an example in "draw a picture" page), then select one of the proper models to generate roadnet block in different (two actually) dimensions.

## Prepare for the running environment
1. A Linux environment (Ubuntu16.04 & above are suggested)
2. Download anaconda (suggested), or pure python3.6 above, docker, etc. as you wish. You just need a [Flask](https://flask.palletsprojects.com/en/2.0.x/) running environment
3. Run it in a test environment. First:
    ```bash
    $> conda create --name "flaskenv" python=3.8
    $> conda activate flaskenv 
    $> cd RoadnetGeneration
    $> pip install -r requirement.txt 【可以选用清华源： -i https://pypi.tuna.tsinghua.edu.cn/simple】
    $> pip install torch torchvision torchaudio 
    $> export FLASK_APP=flaskr
    $> flask run
    ```
    Definitely, you can only do this in a test environment. For production environment, please use **Nginx + Guicorn + Supervisor** and to deploy it.
4. By the way, the trained models are not here, you should use your own and put them in the `flaskr/static/` dir. 

