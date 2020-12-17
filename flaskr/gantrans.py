import functools

from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for, send_file, current_app, send_from_directory
)
from werkzeug.utils import secure_filename
import os, datetime
from PIL import Image
import torch
import torchvision.transforms.functional as vF
from torchvision.utils import save_image

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
bp = Blueprint('gantrans', __name__, url_prefix='/gantrans')
app = current_app

#路由
@bp.route('/')
def onlinepreview():
    return redirect(url_for('gantrans.select'))

#导航
@bp.route('/modeltype')
def select():
    clean_old_uploads(app.config['UPLOAD_FOLDER'])
    return render_template('type-selection.html')

#选择模型尺度后上传图片
@bp.route('/upload/<modeldimension>', methods=['GET', 'POST'])
def upload_pic(modeldimension):
    if request.method == 'POST':
        # check if the post request has the file part
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        # if user does not select file, browser also
        # submit an empty part without filename
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            return send_file(transform(modeldimension, filename))
    return render_template('upload-picture.html', modeldimension=modeldimension)

#开始处理逻辑
def transform(modeldimension, inputName):
    if modeldimension == "Small":
        outputName = 'outputs/small_model_output.png'
        modelPath = 'g_l_be2roe_1028_trace.pt'
        series = 2
    elif modeldimension == "Large":
        outputName = 'outputs/large_model_output.png'
        modelPath = 'g_s_boe2bhf_1107_trace.pt'
        series = 3
    else:
        return "Paremeter Error!"
    return processPicture(inputName, modelPath, outputName, series)

#处理图片流程
def processPicture(inputName, modelPath, outputName, series):
    img_i = vF.to_tensor(Image.open(os.path.join(app.config['UPLOAD_FOLDER'], inputName)))[0:series, :, :].unsqueeze(dim=0)
    model = torch.jit.load(url_for('static', filename=modelPath))
    with torch.no_grad():
        z = torch.randn(1, 256)
        result = model(img_i, z)
        file_path = url_for('static', filename=outputName)
        save_image(result, fp=file_path)
        return file_path

#清理上传文件
def clean_old_uploads(pathtobeclean):
    dirlist = list(os.walk(pathtobeclean)) #获得所有文件夹的信息列表
    delta = datetime.timedelta(hours=1)
    now = datetime.datetime.now()
    for dir in dirlist: #遍历该列表
        os.chdir(dir[0]) #进入本级路径，防止找不到文件而报错
        if dir[2] != []: #如果该路径下有文件
            for file in dir[2]: #遍历这些文件
                createtime = datetime.datetime.fromtimestamp(os.path.getctime(file)) #获取文件创建时间
                if createtime < (now-delta): #若创建于delta天前
                    os.remove(file) #则删掉

#上传文件类型校验
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
