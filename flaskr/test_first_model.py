from PIL import Image
import torch
import torchvision.transforms.functional as vF
from torchvision.utils import save_image


if __name__ == "__main__":
    img_i = vF.to_tensor(Image.open('./input_sample_first_model.png'))[0:2, :, :].unsqueeze(dim=0).cuda()
    model = torch.jit.load("./g_l_be2roe_1028_trace.pt", map_location=torch.device('cuda:0'))
    with torch.no_grad():
        z = torch.randn(1, 256).cuda()
        result = model(img_i, z)
        save_image(result, fp="./first_model_output.png")