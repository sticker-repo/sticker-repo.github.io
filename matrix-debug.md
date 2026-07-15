# send image
m.room.message
```
{
  "msgtype": "m.image",
  "body": "image.png",
  "url": "mxc://sticker-repo.pasha-parfeni.workers.dev/QBpdXrKLOcxYxEflaMACOKoB"
}

{
  "body": "romantic goose",
  "msgtype": "m.image",
  "url": "mxc://sticker-repo.pasha-parfeni.workers.dev/QBpdXrKLOcxYxEflaMACOKoB",
  "info": {
    "mimetype": "image/png",
    "w": 256,
    "h": 256
  }
}
```

# add sticker pack
1. /devtools
2. Explore room state
3. send custom
4. Event type: `m.room.image_pack` (or `im.ponies.room_emotes` for fluffychat), State key: `romantic_goose_pack`
5. 
```
{
  "images": {
    "romantic_goose": {
      "url": "mxc://sticker-repo.pasha-parfeni.workers.dev/QBpdXrKLOcxYxEflaMACOKoB",
      "body": "romantic goose",
      "info": {
        "mimetype": "image/png",
        "w": 256,
        "h": 256
      }
    }
  },
  "pack": {
    "display_name": "Romantic Goose",
    "usage": ["sticker", "emoticon"]
  }
}
```
```
{
  "images": {
    "rabbit": {
      "url": "mxc://sticker-repo.pasha-parfeni.workers.dev/rabbit4webp",
      "body": "rabbit4"
    }
  },
  "pack": {
    "display_name": "Rabbit4",
    "usage": ["sticker", "emoticon"]
  }
}
```
```
{
  "images": {
    "tgs": {
      "url": "mxc://sticker-repo.pasha-parfeni.workers.dev/animtgs",
      "body": "tgs",
      "info": {
        "mimetype": "image/tgs"
      }
    },
    "dottgs": {
      "url": "mxc://sticker-repo.pasha-parfeni.workers.dev/anim.tgs",
      "body": "dottgs",
      "info": {
        "mimetype": "image/tgs"
      }
    },
    "webm": {
      "url": "mxc://sticker-repo.pasha-parfeni.workers.dev/animwebm",
      "body": "webm",
      "info": {
        "mimetype": "video/webm"
      }
    },
    "dotwebm": {
      "url": "mxc://sticker-repo.pasha-parfeni.workers.dev/anim.webm",
      "body": "dotwebm",
      "info": {
        "mimetype": "video/webm"
      }
    }
  },
  "pack": {
    "display_name": "video",
    "usage": ["sticker", "emoticon"]
  }
}
```
