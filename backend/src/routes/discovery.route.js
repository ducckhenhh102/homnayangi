import { Router } from 'express';

const router = Router();

router.get('/discovery/options', (req, res) => {
  res.status(200).json({
    data: {
      companionTypes: [
        { id: 'couple', label: 'Người yêu', desc: 'Không gian lãng mạn, ấm cúng' },
        { id: 'friends', label: 'Nhóm bạn', desc: 'Sôi động, dễ trò chuyện, bàn rộng' },
        { id: 'solo', label: 'Một mình', desc: 'Yên tĩnh, thoải mái, nhanh gọn' },
      ],
      diningTypes: [
        { id: 'snack', label: 'Ăn vặt', desc: 'Trà sữa, bánh tráng, xiên que ăn nhẹ' },
        { id: 'meal', label: 'Ăn bình thường', desc: 'Cơm, phở, bún, lẩu bữa chính' },
        { id: 'drinking', label: 'Đi nhậu', desc: 'Lai rai tối muộn, mồi bén' },
      ],
      maxRadiusKm: 10,
      defaultRadiusKm: 5,
    },
  });
});

export default router;
