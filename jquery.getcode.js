/* jquery.getcode.js
 * ========
 * 短信验证码插件
 * @Author:Mr.Alex
 * @Email:<mail@wangqiqiang.com>
 * @version:1.0.0
 * @date:2019-07-19 14:00:00
 */
(function(window,$,undefined)
{
	$.fn.getCode = function(options,callback)
	{
		// 当前选择器
		var element = this;
		// 当前状态
		var disabled = false;
		// 计时器
		var timing = -1;
		// 默认配置信息
		var defaults = {
			time:60,						// 计时周期
			event:'click',					// 触发事件
			url:'data-url',					// 接口地址
			// 请求参数集合
			params:{
				'mobile':'[name=mobile]',
			},
			method:'post',					// 请求类型
			dataType:'json',				// 响应格式
			message:{
				disabled:'请 %d 秒后发送',	// 冻结状态提示信息
				before:'获取验证码',		// 默认提示信息
				process:'重新发送 %d 秒',	// 发送过程提示信息
				complete:'获取验证码',		// 复原信息
			},
			// 响应数据格式回调方法
			callback:function(data)
			{
				return {
					state:data.state.toString().toLowerCase(),
					message:data.message,
				};
			}
		};
		// 交互回调方法：默认使用layer，可自定义如alert
		var callback = callback || function(message,state)
		{
			return layer.msg(message,{
				shift: state ? 2 : 6
			});
		}
		
		options = $.extend(defaults,options);
		// 监听事件
		$(this).on(options.event,function()
		{
			var url = $(this).attr(options.url);
			// 状态不可用
			if( disabled )
			{
				return callback(options.message.disabled.replace('%d',timing),false);
			}
			// 整理发送参数
			var target = {};
			
			for(var i in options.params)
			{
				target[i] = $(options.params[i]).val();
			}
			// 初始化计数器
			timing = options.time;
			// 发送请求
			$.ajax({
				type:options.method,
				url:url,
				//async:true,//false
				//cache:true,//false
				data:target,
				//timeout: 1000,
				dataType:options.dataType,// html xml json text
				beforeSend:function(XMLHttpRequest)
				{
					console.log('ajax::before');
				},
				success:function(data,textStatus)
				{
					console.log('ajax::success');
					//data.state = 'TRUE';
					// 响应数据格式回调方法
					data = options.callback(data);
					//console.log(data)
					if( data.state == 'false' )
					{
						callback(data.message,false);
						
						return false;
					}
					
					callback(data.message,true);
					// 计数器递归
					var interval = setInterval(function()
					{
						if( timing == 0 )
						{
							$(element).html(options.message.complete);
							disabled = false;
							window.clearInterval(interval);
						}
						else
						{
							$(element).html(options.message.process.replace('%d',timing));
							disabled = true;
							timing -= 1;
						}
					},1000);
					
					return false;
				},
				complete:function(XMLHttpRequest,textStatus)
				{
					console.log('ajax::complete');
				},
				error:function(XMLHttpRequest,textStatus,errorThrown)
				{
					console.log('ajax::error');
				}
			});
			
			return false;
		});
		// 返回jQuery对象支持链式编程
		return this;
	};
})(window,jQuery);