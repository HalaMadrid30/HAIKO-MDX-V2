FROM node:lts-buster
RUN git clone https://github.com/PROFESSEURMDX/HAIKO-MDX-V2/root/PROFESSEURMDX
WORKDIR /root/PROFESSEURMDX
RUN npm install && npm install -g pm2 || yarn install --network-concurrency 1
COPY . .
EXPOSE 9090
CMD ["npm", "start"]

