from PIL import Image
import torch
import torchvision.transforms.functional as vF
from torchvision.utils import save_image


if __name__ == "__main__":
    img_i = vF.to_tensor(Image.open('./input_sample_second_model.png'))[0:3, :, :].unsqueeze(dim=0).cuda()
    model = torch.jit.load("./g_s_boe2bhf_1107_trace.pt", map_location=torch.device('cuda:0'))
    with torch.no_grad():
        z = torch.randn(1, 256).cuda()
        result = model(img_i, z)  # 3 channels
        save_image(result, fp="./second_model_output.png")