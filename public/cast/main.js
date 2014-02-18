function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

$(document).ready(function() {
    var pcConfig = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
    var pcConstraints = {"optional": []};
    var remoteVideo = document.getElementById("remoteVideo");
    var iceCandidates = [];

    var pc = new webkitRTCPeerConnection(pcConfig, pcConstraints);
    pc.onaddstream = function(event) {
        remoteVideo.src = URL.createObjectURL(event.stream);
    }
    pc.onicecandidate = function(event){
      if (event.candidate) {
        // pc.addIceCandidate(new RTCIceCandidate(event.candidate));
        console.log(event.candidate);
        iceCandidates.push({candidate: event.candidate.candidate, sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex });
      }
    }

    var v = getUrlVars();

    var sessionUrl = v.sessionUrl;
    if (sessionUrl == null)
        sessionUrl = '/session';
    else
        sessionUrl = decodeURIComponent(sessionUrl);


    function connectSession() {
        $.get(sessionUrl, function(data) {
            console.log(data);

            var message = { type: 'offer', sdp: data.sdp };
            pc.setRemoteDescription(new RTCSessionDescription(message));

            for (var i in data.ice) {
                var d = data.ice[i];
                var r = new RTCIceCandidate(d);
                pc.addIceCandidate(r);
            }

            pc.createAnswer(function(description) {
                pc.setLocalDescription(description);

                function startSession() {
                    $.post(sessionUrl, { sdp: description.sdp, ice: JSON.stringify(iceCandidates) }, function(data) {
                        console.log(data);
                    });
                }

                setTimeout(startSession, 1000);
            });
        });
    }

    try {
        if (!window.chrome) {
            console.log('not chrome');
        }
        else if (!chrome.socket) {
            console.log('not chrome.socket');
        }
        else {
            console.log('has chrome.socket!');
        }

        cast.receiver.logger.setLevelValue(cast.receiver.LoggerLevel.DEBUG);
        var castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
        var appConfig = new cast.receiver.CastReceiverManager.Config();
        appConfig.statusText = 'Waiting for Android';
        appConfig.maxInactivity = 6000;
        var customMessageBus = castReceiverManager.getCastMessageBus('urn:x-cast:com.koushikdutta.mirror');
        customMessageBus.onMessage = function(event) {
           // Handle message
           sessionUrl = event.data;
           connectSession();
        }
        castReceiverManager.start(appConfig);
    }
    catch (e) {
        console.log(e);
    }

    connectSession();
});