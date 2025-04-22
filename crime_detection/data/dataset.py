
from torch.utils.data import Dataset
import os
import cv2
from PIL import Image
import torch

class CrimeVideoDataset(Dataset):
    def __init__(self, root_dir, max_frames=16, transform=None):
        self.root_dir = root_dir
        self.max_frames = max_frames
        self.transform = transform
        self.classes = ['Abuse', 'Arrest', 'Arson', 'Assault']
        self.samples = []

        for label, class_name in enumerate(self.classes):
            class_dir = os.path.join(root_dir, class_name)
            if os.path.exists(class_dir):
                for file in os.listdir(class_dir):
                    if file.endswith(".mp4"):
                        self.samples.append((os.path.join(class_dir, file), label))

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        video_path, label = self.samples[idx]
        frames = self.load_video_frames(video_path)
        if self.transform:
            frames = [self.transform(frame) for frame in frames]
        video_tensor = torch.stack(frames)  # shape: [T, C, H, W]
        return video_tensor, label

    def load_video_frames(self, video_path):
        cap = cv2.VideoCapture(video_path)
        frames = []
        count = 0
        while count < self.max_frames and cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frame = Image.fromarray(frame)
            frames.append(frame)
            count += 1
        cap.release()

        # Pad if video has fewer than max_frames
        while len(frames) < self.max_frames:
            frames.append(frames[-1] if frames else Image.new('RGB', (224, 224)))  # repeat last frame or create empty

        return frames[:self.max_frames]
