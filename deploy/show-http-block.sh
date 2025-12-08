#!/bin/bash
# Показать полный HTTP блок

echo "Полный HTTP блок для rosebotanique.store:"
echo "=========================================="
grep -A 20 "Rosebotanique.store HTTP" /root/Shtraf/nginx/nginx.conf | head -25

